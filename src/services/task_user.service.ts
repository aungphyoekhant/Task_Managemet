import { prisma } from "../lib/prisma.js"
import { auditService } from "./audit.service.js"; // လိုအပ်ပါက audit service

export const taskUserService = {
  assignUserToTask: async (payload: {
    taskId: number;
    userIdToAssign: number;
    currentUserId: number;
    workspaceId: number;
    projectId: number;
  }) => {
    const { taskId, userIdToAssign, currentUserId, workspaceId, projectId } = payload;
    
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error("Task not found.");
    }

    const workspaceMember = await prisma.workspaceUser.findFirst({
      where: { userId: userIdToAssign, workspaceId: workspaceId },
    });

    if (!workspaceMember) {
      throw new Error("User is not a member of this workspace.");
    }

    return await prisma.$transaction(async (tx) => {
      const taskUser = await tx.taskUser.create({
        data: {
          workspaceId: workspaceId,
          projectId: projectId,
          taskId: taskId,
          userId: userIdToAssign,
          role: "MEMBER",
        },
      });

      const notification = await tx.notification.create({
        data: {
          workspaceId: workspaceId,
          userId: userIdToAssign,
          message: `You have been assigned to task: "${task.title}"`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: userIdToAssign,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        workspaceId: workspaceId,
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
    userIdToRemove: number,
    currentUserId: number,
    workspaceId: number
  ) => {
    // 1. Assignment ရှိမရှိ စစ်ဆေးခြင်း
    const taskUser = await prisma.taskUser.findFirst({
      where: { taskId: taskId, userId: userIdToRemove },
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
        workspaceId: workspaceId,
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
      
    });
  },

  
};