import { prisma } from "../lib/prisma.js"
import { auditService } from "./audit.service.js"; 

export const taskUserService = {

  assignUserToTask: async (payload: {
    taskId: number;
    userId: number;
    currentUserId: number;
    workspaceId: number;
    projectId: number;
  }) => {
    const { taskId, userId, currentUserId, workspaceId, projectId } = payload;

    console.log(userId, workspaceId)

    
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error("Task not found.");
    }


    const workspaceMember = await prisma.workspaceUser.findFirst({
      where: { userId: userId, workspaceId: workspaceId },
    });

    if (!workspaceMember) {
      throw new Error("User is not a member of this workspace.");
    }

    return await prisma.$transaction(async (tx) => {
      
      const existingAssignment = await tx.taskUser.findFirst({
        where: { taskId: taskId },
      });

   
      if (existingAssignment) {
        await tx.taskUser.delete({
          where: { id: existingAssignment.id },
        });
      }

      const taskUser = await tx.taskUser.create({
        data: {
          workspaceId: workspaceId,
          projectId: projectId,
          taskId: taskId,
          userId: userId,
          role: "MEMBER",
        },
      });

      const notification = await tx.notification.create({
        data: {
          workspaceId: workspaceId,
          userId: userId,
          message: `You have been assigned to task: "${task.title}"`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: userId,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        userId: currentUserId,
        action: "ASSIGN_TASK_USER",
        entityType: "TASK",
        entityId: taskId,
      });

      return taskUser;
    });
  },

  removeUserFromTask: async (
    taskId: number,
    userId: number,
    currentUserId: number,
    workspaceId: number
  ) => {
    // 1. Assignment ရှိမရှိ စစ်ဆေးခြင်း
    const taskUser = await prisma.taskUser.findFirst({
      where: { taskId: taskId, userId: userId },
    });

    if (!taskUser) {
      throw new Error("Assignment not found for this user on this task.");
    }

    // 2. Transaction ဖြင့် ဖျက်ခြင်းနှင့် Activity Log မှတ်တမ်းတင်ခြင်း
    return await prisma.$transaction(async (tx) => {
      await tx.taskUser.delete({
        where: { id: taskUser.id },
      });

      await auditService.ActivityLog({
        userId: currentUserId,
        action: "REMOVE_TASK_USER",
        entityType: "TASK",
        entityId: taskId,
      });

      return { message: "User successfully removed from task." };
    });
  },

 getTaskAssignees: async (taskId: number) => {
    return await prisma.taskUser.findMany({
      where: { taskId: taskId },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  
};