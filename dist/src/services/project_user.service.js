import { prisma } from "../lib/prisma.js";
import { auditService } from "./audit.service.js";
import { Role } from "../../generated/prisma/enums.js";
import { io } from "../index.js";
export const projectUserService = {
    addMember: async (workspaceId, projectId, userIdsInput, addedById, role) => {
        // 1. Array Normalization
        const targetUserIds = Array.isArray(userIdsInput) ? userIdsInput : [userIdsInput];
        if (targetUserIds.length === 0) {
            throw new Error("No users provided to assign");
        }
        // 2. Project နဲ့ Workspace ID Valid ဖြစ်မဖြစ် သေချာစေရန် ID ပြောင်းလဲခြင်း
        const wId = Number(workspaceId);
        const pId = Number(projectId);
        if (isNaN(wId) || isNaN(pId)) {
            throw new Error("Invalid workspaceId or projectId provided");
        }
        // 3. Project အမည်ကို Notification ထဲတွင် ထည့်ရန် ရှာဖွေခြင်း
        const project = await prisma.project.findUnique({
            where: { id: pId },
            select: { name: true },
        });
        // 4. Target User တွေ Workspace ထဲမှာ ရှိမရှိ စစ်ဆေးခြင်း
        const usersInWorkspace = await prisma.workspaceUser.findMany({
            where: {
                workspaceId: wId,
                userId: { in: targetUserIds },
            },
        });
        if (usersInWorkspace.length !== targetUserIds.length) {
            const foundUserIds = usersInWorkspace.map((u) => u.userId);
            const missingUserIds = targetUserIds.filter((id) => !foundUserIds.includes(id));
            throw new Error(`User(s) with ID ${missingUserIds.join(", ")} are not part of this workspace`);
        }
        // 5. Target User တွေ Project ထဲမှာ ရောက်ပြီးသား ဟုတ်မဟုတ် စစ်ဆေးခြင်း
        const existingProjectMembers = await prisma.projectUser.findMany({
            where: {
                projectId: pId,
                userId: { in: targetUserIds },
            },
        });
        if (existingProjectMembers.length > 0) {
            const alreadyMemberIds = existingProjectMembers.map((m) => m.userId);
            throw new Error(`User(s) with ID ${alreadyMemberIds.join(", ")} are already members of this project`);
        }
        const workspaceUserRoleMap = new Map(usersInWorkspace.map((u) => [u.userId, u.role]));
        const createData = targetUserIds.map((uId) => ({
            workspaceId: wId,
            projectId: pId,
            userId: uId,
            addedById: Number(addedById),
            role: role || workspaceUserRoleMap.get(uId) || Role.MEMBER,
        }));
        const result = await prisma.$transaction(async (tx) => {
            const projectUsers = await Promise.all(createData.map((data) => tx.projectUser.create({ data })));
            const notificationsData = targetUserIds.map((uId) => ({
                userId: uId,
                workspaceId: wId,
                message: `You have been added to the project "${project?.name || 'Project'}".`,
                isRead: false,
            }));
            await tx.notification.createMany({
                data: notificationsData,
            });
            return projectUsers;
        });
        if (io) {
            targetUserIds.forEach((uId) => {
                io.emit(`notification::${uId}`, {
                    title: "New Project Assignment",
                    message: `You have been added to the project "${project?.name || 'Project'}".`,
                    createdAt: new Date(),
                });
            });
        }
        return result;
    },
    getMembersByProject: async (workspaceId, projectId, userId) => {
        const project = await prisma.project.findFirst({
            where: { id: projectId },
        });
        if (!project)
            throw new Error("Project not found");
        const memberRole = await prisma.workspaceUser.findFirst({
            where: { userId, workspaceId: workspaceId },
        });
        if (!memberRole) {
            throw new Error("Access denied: You are not part of this workspace");
        }
        return await prisma.projectUser.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { name: true, avatar: true } },
                    },
                },
            },
        });
    },
    removeMember: async (workspaceId, projectId, projectUserId, userId) => {
        // 1. Data Type Normalization
        const wId = Number(workspaceId);
        const pId = Number(projectId);
        const puId = Number(projectUserId);
        const actorUserId = Number(userId);
        // 2. Member ရှိမရှိ စစ်ဆေးပြီး ဖျက်ရမယ့် Target User ID ကို ယူခြင်း
        const member = await prisma.projectUser.findUnique({
            where: { id: puId },
            include: {
                project: { select: { workspaceId: true, name: true } }
            }
        });
        if (!member)
            throw new Error("Member not found");
        // 3. Permission စစ်ဆေးခြင်း
        const actorRole = await prisma.workspaceUser.findFirst({
            where: { userId: actorUserId, workspaceId: wId }
        });
        if (!actorRole || (actorRole.role !== "ADMIN" && actorRole.role !== "OWNER")) {
            throw new Error("Access denied: Only Admins/Owners can remove members");
        }
        const targetUserId = member.userId;
        const projectName = member.project?.name || "Project";
        const result = await prisma.$transaction(async (tx) => {
            await tx.taskUser.deleteMany({
                where: {
                    projectId: pId,
                    userId: targetUserId,
                    workspaceId: wId
                }
            });
            if (auditService?.ActivityLog) {
                await auditService.ActivityLog({
                    userId: actorUserId,
                    action: "REMOVE_MEMBER",
                    entityType: "PROJECT_USER",
                    entityId: puId,
                });
            }
            const notification = await tx.notification.create({
                data: {
                    userId: targetUserId,
                    workspaceId: wId,
                    message: `You have been removed from the project "${projectName}".`,
                    isRead: false,
                }
            });
            await tx.userNoti.create({
                data: {
                    userId: targetUserId,
                    notificationId: notification.id,
                }
            });
            await tx.projectUser.delete({ where: { id: puId } });
            return { success: true, removedUserId: targetUserId, projectName };
        });
        if (io) {
            io.emit(`notification::${targetUserId}`, {
                title: "Removed from Project",
                message: `You have been removed from the project "${projectName}".`,
                createdAt: new Date(),
            });
        }
        return result;
    },
    // getProjectMemberById: async (projectUserId: number) => {
    //   return await prisma.projectUser.findUnique({
    //     where: { id: projectUserId },
    //     include: { project: true },
    //   })
    // },
    // getProjectUserByUserId: async (projectId: number, userId: number) => {
    //   return await prisma.projectUser.findFirst({
    //     where: { projectId: projectId, userId: userId },
    //   })
    // }
};
