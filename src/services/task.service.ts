import { prisma } from "../lib/prisma.js"
import { CreateTaskPayload } from "../types/global.js";
import { auditService } from "./audit.service.js";
import { TaskStatus } from "../../generated/prisma/client.js";

export const taskService = {
  canManageProjectTasks: async (projectId: number, userId: number) => {
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

    if (!project) return false;

    if (Number(project.createBy) === Number(userId)) return true;

    const role = project.projectUsers[0]?.role;
    if (role && (role.toString().toUpperCase() === "OWNER" || role.toString().toUpperCase() === "ADMIN")) return true;

    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId: project.workspaceId,
        userId: userId,
        role: "OWNER",
      },
    });

    return !!workspaceUser;
  },

   createTask: async (data: CreateTaskPayload, userId: number) => {
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
  } ,

  getTaskById: async (taskId: number) => {
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

  getTasks: async (workspaceId: number, projectId: number, cursor?: number, limit: number = 10) => {
    // 1. Task များကို ယူခြင်း (projectId ပါ ထည့်စစ်ရန်)
    const tasks = await prisma.task.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where: { 
        workspaceId: Number(workspaceId),
        projectId: Number(projectId),
      },
      orderBy: { createdAt: "desc" },
      include: { 
        comments: true, 
        taskUsers: true 
      },
    });

    const hasNextPage = tasks.length > limit;
    const nextCursor = hasNextPage ? tasks[limit - 1].id : undefined;
    const data = hasNextPage ? tasks.slice(0, limit) : tasks;

    // 2. Workspace User များကိုပါ တစ်ခတည်း တွဲထုတ်ပေးခြင်း
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
      data, 
      workspaceUsers, // ⚡️ Workspace Users များကိုပါ ထည့်ပေးလိုက်သည်
      nextCursor, 
      hasNextPage 
    };
  },

 updateTask: async (taskId: number, data: any, userId: number) => {
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

  deleteTask: async (taskId: number, userId: number) => {
    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        select: { workspaceId: true },
      });

      if (!task) throw new Error("Task not found");

      const member = await tx.workspaceUser.findFirst({
          where: { userId, workspaceId: task.workspaceId }
        });

     if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
         throw new Error("Access denied: Only Admins/Owners can delete tasks");
      }

      await tx.task.delete({ where: { id: taskId } });

      const notification = await tx.notification.create({
        data: {
          workspaceId: task.workspaceId,
          userId: userId,
          message: `Task deleted successfully`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: userId,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        userId: userId,
        action: "DELETE_TASK",
        entityType: "TASK",
        entityId: taskId,
      });
    });
  },

 updateAssignedTask: async (
  taskId: number,
  data: { status?: TaskStatus  },
  currentUserId: number,
  workspaceId: number,
  projectId?: number,
) => {
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

  isUserAssignedToTask: async (taskId: number, userId: number) => {
    const taskUser = await prisma.taskUser.findFirst({
      where: { taskId: taskId, userId: userId },
    });
    return !!taskUser; 
  },
};
