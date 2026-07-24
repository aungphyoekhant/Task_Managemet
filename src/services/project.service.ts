import { ProjectStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { auditService } from "./audit.service.js";

export const projectService = {
  createProject: async (projectData: {
    projectName: string;
    description: string;
    status : ProjectStatus,
    startDate: string | Date;
    endDate: string | Date;
    workspaceId: number;
    createBy: number;
  }) => {
    const { projectName, description,status, startDate, endDate, workspaceId, createBy } = projectData;

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
          status: (status ? status.toUpperCase() : "PENDING") as ProjectStatus,
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

 
  getProjectById: async (projectId: number, workspaceId: number) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        projectUsers: true,
      },
    });

    if (!project) return null;

    const workspaceUsers = await prisma.workspaceUser.findMany({
      where: {
        workspaceId: workspaceId,
      },
      select: {
        role: true,
        user: true, 
      },
    });

    return {
      ...project,
      workspaceUsers,
    };
  },

  getAllProjects: async (workspaceId: number) => {
    
    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        tasks: true,
        projectUsers: true,
      },
    });

    const workspaceUsers = await prisma.workspaceUser.findMany({
      where: {
        workspaceId: workspaceId,
      },
      select: {
        role: true,
      },
    });

    return {
      projects,
      workspaceUsers,
    };
  },
  
 updateProject: async (
    projectId: number, 
    workspaceId: number, 
    data: { projectName: string; description: string; status: string; startDate: Date; endDate: Date }
  ) => {
    return await prisma.$transaction(async (tx) => {
      
      const updatedProject = await tx.project.update({
        where: { 
          id: projectId,
        },
        data: {
          name: data.projectName,
          description: data.description,
          status: (data.status ? data.status.toUpperCase() : "PENDING") as ProjectStatus,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
        include: {
          tasks: true,
          projectUsers: true,
        },
      });

      const workspaceUsers = await tx.workspaceUser.findMany({
        where: {
          workspaceId: updatedProject.workspaceId,
        },
        select: {
          role: true,
          userId: true,
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

      return {
        ...updatedProject,
        workspaceUsers,
      };
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
