import { prisma } from "../lib/prisma";
import { auditService } from "./audit.service";

export const projectService = {
  createProject: async (projectData: {
    projectName: string;
    description: string;
    startDate: Date;
    endDate: Date;
    workspaceId: number;
    createBy: number;
  }) => {
    const { projectName, description, startDate, endDate, workspaceId, createBy } = projectData;

    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { workspaceId: workspaceId, userId: createBy },
    });

    if (!workspaceUser || (workspaceUser.role !== "OWNER" && workspaceUser.role !== "ADMIN")) {
      throw new Error("Forbidden: You do not have permission");
    }

    return await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: projectName,
          description: description,
          startDate: startDate,
          endDate: endDate,
          workspaceId: workspaceId,
          createBy: createBy,
        },
      });

      const notification = await tx.notification.create({
        data: {
          workspaceId: newProject.workspaceId,
          userId: newProject.createBy,
          message: `Project created successfully`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: newProject.createBy,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        workspaceId: newProject.workspaceId,
        userId: newProject.createBy,
        action: "CREATE_PROJECT",
        entityType: "PROJECT",
        entityId: newProject.id,
      });

      return newProject;
    });
  },

  getProjectById: async (projectId: number) => {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        projectUsers: true,
      },
    });
  },

  getAllProjects: async (workspaceId: number) => {
    return await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        tasks: true,
        projectUsers: true,
      },
    });
  },

  updateProject: async (projectId: number, data: { name: string; description: string; startDate: Date; endDate: Date }) => {
    return await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });

      const notification = await tx.notification.create({
        data: {
          workspaceId: updatedProject.workspaceId,
          userId: updatedProject.createBy,
          message: `Project updated successfully`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: updatedProject.createBy,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        workspaceId: updatedProject.workspaceId,
        userId: updatedProject.createBy,
        action: "UPDATE_PROJECT",
        entityType: "PROJECT",
        entityId: projectId,
      });

      return updatedProject;
    });
  },

  deleteProject: async (projectId: number) => {
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.delete({
        where: { id: projectId },
      });

      const notification = await tx.notification.create({
        data: {
          workspaceId: project.workspaceId,
          userId: project.createBy,
          message: `Project deleted successfully`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: project.createBy,
          notificationId: notification.id,
        },
      });

      await auditService.ActivityLog({
        workspaceId: project.workspaceId,
        userId: project.createBy,
        action: "DELETE_PROJECT",
        entityType: "PROJECT",
        entityId: projectId,
      });

      return project;
    });
  },
};
