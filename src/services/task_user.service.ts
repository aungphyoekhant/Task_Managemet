import { prisma } from "../lib/prisma.js";
import { auditService } from "./audit.service.js"; 
import { io } from "../index.js"; 

export const taskUserService = {
  assignUserToTask: async (payload: {
    taskId: number;
    userId: number;
    currentUserId: number;
    workspaceId: number;
    projectId: number;
  }) => {
    const { taskId, userId, currentUserId, workspaceId, projectId } = payload;


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

      io.emit(`notification::${userId}`, {
        message: `You have been assigned to task: "${task.title}"`,
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
  const tId = Number(taskId);
  const uId = Number(userId);
  const actorUserId = Number(currentUserId);
  const wId = Number(workspaceId);

  const taskUser = await prisma.taskUser.findFirst({
    where: { taskId: tId, userId: uId },
    include: {
      task: { select: { title: true } }
    }
  });

  if (!taskUser) {
    throw new Error("Assignment not found for this user on this task.");
  }

  const taskTitle = taskUser.task?.title || "Task";

  const result = await prisma.$transaction(async (tx) => {
    await tx.taskUser.delete({
      where: { id: taskUser.id },
    });

    const notification = await tx.notification.create({
      data: {
        workspaceId: wId,
        userId: uId,
        message: `You have been removed from task: "${taskTitle}"`,
        isRead: false,
      },
    });

    await tx.userNoti.create({
      data: {
        userId: uId,
        notificationId: notification.id,
      },
    });

    if (auditService?.ActivityLog) {
      await auditService.ActivityLog({
        userId: actorUserId,
        action: "REMOVE_TASK_USER",
        entityType: "TASK",
        entityId: tId,
      });
    }

    return { message: "User successfully removed from task." };
  });

  if (io) {
    io.emit(`notification::${uId}`, {
      title: "Removed from Task",
      message: `You have been removed from task: "${taskTitle}"`,
      createdAt: new Date(),
    });
  }

  return result;
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
  },
};