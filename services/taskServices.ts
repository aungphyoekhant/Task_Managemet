import { prisma } from "../lib/prisma";

export const taskService = {
  // Permission စစ်ဖို့အတွက် (Controller က ခေါ်သုံးရန်)
  canManageProjectTasks: async (projectId: number, userId: number) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { createBy: true, projectUsers: { where: { userId }, select: { role: true }, take: 1 } },
    });
    if (!project) return false;
    if (project.createBy === userId) return true;
    const role = project.projectUsers[0]?.role;
    return role === "OWNER" || role === "ADMIN";
  },

  createTask: async (data: any) => {
    return await prisma.task.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        projectUserId: data.projectUserId,
        assignedTo: data.assignedTo,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
      },
      include: {
        projectUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                status: true,
                profile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  getTaskById: async (taskId: number) => {
    return await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        projectUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                status: true,
                profile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  updateTask: async (taskId: number, data: any) => {
    return await prisma.task.update({ where: { id: taskId }, data });
  },

  deleteTask: async (taskId: number) => {
    return await prisma.task.delete({ where: { id: taskId } });
  },

  updateAssignedTask: async (taskId: number, data: { status?: any; priority?: any }) => {
    return await prisma.task.update({
      where: { id: taskId },
      data: data,
    });
  },
};
