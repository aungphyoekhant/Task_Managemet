import { prisma } from "../lib/prisma";
import { CreateTaskPayload } from "../types/global";
import { auditService } from "./audit.service";

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

  createTask: async (data: CreateTaskPayload) => {
    const member = await prisma.projectUser.findFirst({
      where: {
        userId: data.assignedTo,
        projectId: data.projectId,
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    return await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          workspaceId: data.workspaceId,
          projectId: data.projectId,
          assignedTo: data.assignedTo,
          title: data.title,
          description: data.description || null,
          priority: data.priority || "MEDIUM",
          status: data.status || "TODO",
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        },
        include: {
          comments: true,
        },
      });

      // Notification ဖန်တီးခြင်း
      await tx.notification.create({
        data: {
          workspaceId: data.workspaceId,
          userId: data.assignedTo,
          message: `You have been assigned to: ${data.title}`,
        },
      });

      // Activity Log ဖန်တီးခြင်း
      await auditService.ActivityLog({
        workspaceId: data.workspaceId,
        userId: data.assignedTo,
        action: "CREATE_TASK",
        entityType: "TASK",
        entityId: newTask.id,
      });

      return newTask;
    });
  },

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
      },
    });
  },

  getTasks: async (workspaceId: number, cursor?: number, limit: number = 10) => {
    const tasks = await prisma.task.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: { comments: true },
    });

    const hasNextPage = tasks.length > limit;
    const nextCursor = hasNextPage ? tasks[limit - 1].id : undefined;
    const data = hasNextPage ? tasks.slice(0, limit) : tasks;

    return { data, nextCursor, hasNextPage };
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
          userId: updatedTask.assignedTo,
          message: `Task "${updatedTask.title}" has been updated`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: updatedTask.assignedTo,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        workspaceId: updatedTask.workspaceId,
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
        workspaceId: task.workspaceId,
        userId: userId,
        action: "DELETE_TASK",
        entityType: "TASK",
        entityId: taskId,
      });
    });
  },

  updateAssignedTask: async (taskId: number, data: { status?: any; priority?: any }, workspaceId: number) => {
    return await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: data,
      });

      const notification = await tx.notification.create({
        data: {
          workspaceId: updatedTask.workspaceId,
          userId: updatedTask.assignedTo,
          message: `Task "${updatedTask.title}" status has been updated to ${updatedTask.status}`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: updatedTask.assignedTo,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        workspaceId: updatedTask.workspaceId,
        userId: updatedTask.assignedTo,
        action: "DELETE_TASK",
        entityType: "TASK",
        entityId: taskId,
      });

      return updatedTask;
    });
  },
};
