import { prisma } from "../lib/prisma.js";
import { auditService } from "./audit.service.js";
import { io } from "../index.js";
export const taskService = {
    canManageProjectTasks: async (projectId, userId) => {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                createBy: true,
                workspaceId: true,
                projectUsers: {
                    where: { userId },
                    select: { role: true },
                    take: 1,
                },
            },
        });
        if (!project)
            return false;
        if (Number(project.createBy) === Number(userId))
            return true;
        const role = project.projectUsers[0]?.role;
        if (role && (role.toString().toUpperCase() === "OWNER" || role.toString().toUpperCase() === "ADMIN"))
            return true;
        const workspaceUser = await prisma.workspaceUser.findFirst({
            where: {
                workspaceId: project.workspaceId,
                userId: userId,
                role: "OWNER",
            },
        });
        return !!workspaceUser;
    },
    createTask: async (data, userId) => {
        const workspaceMember = await prisma.workspaceUser.findFirst({
            where: { userId: userId, workspaceId: data.workspaceId },
        });
        if (!workspaceMember) {
            throw new Error("You are not a member of this workspace.");
        }
        const project = await prisma.project.findFirst({
            where: { id: data.projectId, workspaceId: data.workspaceId },
        });
        if (!project) {
            throw new Error("Project not found in this workspace.");
        }
        const isWorkspaceAdmin = ["ADMIN", "OWNER"].includes(workspaceMember.role);
        if (!isWorkspaceAdmin) {
            const projectMember = await prisma.projectUser.findFirst({
                where: { userId: userId, projectId: data.projectId },
            });
            if (!projectMember) {
                throw new Error("You do not have access to this project.");
            }
        }
        return await prisma.$transaction(async (tx) => {
            const newTask = await tx.task.create({
                data: {
                    workspaceId: data.workspaceId,
                    projectId: data.projectId,
                    title: data.title,
                    description: data.description || null,
                    priority: data.priority || "MEDIUM",
                    status: data.status || "TODO",
                    dueDate: data.dueDate ? new Date(data.dueDate) : null,
                },
            });
            const notification = await tx.notification.create({
                data: {
                    workspaceId: newTask.workspaceId,
                    userId: userId,
                    message: `Task created successfully`,
                },
            });
            await auditService.ActivityLog({
                userId: userId,
                action: "CREATE_TASK",
                entityType: "TASK",
                entityId: newTask.id,
            });
            return newTask;
        });
    },
    getTaskById: async (taskId) => {
        return await prisma.task.findFirst({
            where: {
                id: taskId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                comments: true,
                taskUsers: true,
            },
        });
    },
    getTasks: async (workspaceId, projectId, userId, cursor, limit = 10, status) => {
        const member = await prisma.workspaceUser.findUnique({
            where: {
                userId_workspaceId: {
                    workspaceId: Number(workspaceId),
                    userId: Number(userId)
                }
            },
        });
        if (!member)
            throw new Error("Access denied");
        const whereCondition = {
            workspaceId: Number(workspaceId),
            projectId: Number(projectId),
        };
        if (status && status !== "ALL") {
            whereCondition.status = status;
        }
        if (member.role === "MEMBER") {
            whereCondition.taskUsers = {
                some: { userId: Number(userId) },
            };
        }
        const total = await prisma.task.count({
            where: whereCondition,
        });
        const tasks = await prisma.task.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            where: whereCondition,
            orderBy: { createdAt: "desc" },
            include: {
                comments: true,
                taskUsers: true
            },
        });
        const hasNextPage = tasks.length > limit;
        const nextCursor = hasNextPage ? tasks[limit - 1].id : undefined;
        const data = hasNextPage ? tasks.slice(0, limit) : tasks;
        const workspaceUsers = await prisma.workspaceUser.findMany({
            where: {
                workspaceId: Number(workspaceId),
            },
            select: {
                role: true,
                userId: true,
                workspaceId: true,
            },
        });
        return {
            total,
            data,
            workspaceUsers,
            nextCursor,
            hasNextPage
        };
    },
    updateTask: async (taskId, data, userId) => {
        return await prisma.$transaction(async (tx) => {
            const updatedTask = await tx.task.update({
                where: { id: taskId },
                data: data,
            });
            const notification = await tx.notification.create({
                data: {
                    workspaceId: updatedTask.workspaceId,
                    userId: userId,
                    message: `Task updated successfully`,
                },
            });
            await auditService.ActivityLog({
                userId: userId,
                action: "UPDATE_TASK",
                entityType: "TASK",
                entityId: taskId,
            });
            return updatedTask;
        });
    },
    deleteTask: async (taskId, userId) => {
        // 1. Data Types Normalization
        const tId = Number(taskId);
        const actorUserId = Number(userId);
        // 2. Task, Workspace နဲ့ Task assign ခံထားရတဲ့ User များကို ရှာဖွေခြင်း
        const task = await prisma.task.findUnique({
            where: { id: tId },
            select: {
                workspaceId: true,
                title: true,
                taskUsers: { select: { userId: true } } // Task Assign ခံထားရသည့် မန်ဘာများ
            },
        });
        if (!task)
            throw new Error("Task not found");
        // 3. Permission စစ်ဆေးခြင်း
        const member = await prisma.workspaceUser.findFirst({
            where: { userId: actorUserId, workspaceId: task.workspaceId }
        });
        if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
            throw new Error("Access denied: Only Admins/Owners can delete tasks");
        }
        // Noti ပို့ရမည့် Target User များ (Task Members + Action လုပ်သူ)
        const taskMemberIds = task.taskUsers.map((tu) => tu.userId);
        const targetUserIds = Array.from(new Set([...taskMemberIds, actorUserId]));
        const wId = task.workspaceId;
        const taskTitle = task.title;
        // 4. Database Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Target User အားလုံးအတွက် Notification ဆောက်ခြင်း
            for (const uId of targetUserIds) {
                const notification = await tx.notification.create({
                    data: {
                        workspaceId: wId,
                        userId: uId,
                        message: `Task "${taskTitle}" has been deleted.`,
                        isRead: false,
                    },
                });
                await tx.userNoti.create({
                    data: {
                        userId: uId,
                        notificationId: notification.id,
                    },
                });
            }
            // Task ကို ဖျက်ခြင်း (TaskUser အလိုအလျောက် Cascade Delete/Clean ထွက်သွားမည်)
            await tx.task.delete({ where: { id: tId } });
            // Activity Log ရေးခြင်း
            if (auditService?.ActivityLog) {
                await auditService.ActivityLog({
                    userId: actorUserId,
                    action: "DELETE_TASK",
                    entityType: "TASK",
                    entityId: tId,
                });
            }
            return { success: true };
        });
        // 5. Transaction ပြီးမြောက်မှ Socket Emit တိုက်ရိုက်လုပ်ခြင်း
        if (io) {
            targetUserIds.forEach((uId) => {
                io.emit(`notification::${uId}`, {
                    title: "Task Deleted",
                    message: `Task "${taskTitle}" has been deleted.`,
                    createdAt: new Date(),
                });
            });
        }
        return result;
    },
    updateAssignedTask: async (taskId, data, currentUserId, workspaceId, projectId) => {
        return await prisma.$transaction(async (tx) => {
            const updatedTask = await tx.task.update({
                where: { id: taskId },
                data: {
                    ...(data.status && { status: data.status }),
                },
                include: {
                    taskUsers: true,
                },
            });
            for (const tu of updatedTask.taskUsers) {
                if (tu.userId !== currentUserId) {
                    const notification = await tx.notification.create({
                        data: {
                            workspaceId: workspaceId,
                            userId: tu.userId,
                            message: `Task "${updatedTask.title}" status has been updated to ${updatedTask.status}`,
                        },
                    });
                    await tx.userNoti.create({
                        data: {
                            userId: tu.userId,
                            notificationId: notification.id,
                        },
                    });
                    io.emit(`notification::${tu.userId}`, {
                        message: `Task "${updatedTask.title}" status has been updated to ${updatedTask.status}`,
                    });
                }
            }
            await auditService.ActivityLog({
                userId: currentUserId,
                action: "UPDATE_TASK",
                entityType: "TASK",
                entityId: taskId,
            });
            return updatedTask;
        });
    },
    isUserAssignedToTask: async (taskId, userId) => {
        const taskUser = await prisma.taskUser.findFirst({
            where: { taskId: taskId, userId: userId },
        });
        return !!taskUser;
    },
};
