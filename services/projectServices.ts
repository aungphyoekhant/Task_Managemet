import { prisma } from "../lib/prisma";

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

    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: description,
        startDate: startDate,
        endDate: endDate,
        workspaceId: workspaceId,
        createBy: createBy,
      },
    });

    return project;
  },

  getProjectById: async (projectId: number) => {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectUsers: true,
        tasks: true,
      },
    });
  },

  getAllProjects: async (workspaceId: number) => {
    return await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        projectUsers: true,
        tasks: true,
      },
    });
  },

  updateProject: async (projectId: number, data: { name: string; description: string; startDate: Date; endDate: Date }) => {
    return await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  },

  deleteProject: async (projectId: number) => {
    return await prisma.project.delete({
      where: { id: projectId },
    });
  },
};
