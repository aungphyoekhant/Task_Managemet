import { prisma } from "../lib/prisma";

export const workspaceService = {
  getWorkspace: async (userId: number, workspaceId: number) => {
    return await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
      include: {
        projects: true,
        workspaceUsers: true,
        tasks: true,

        invitations: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
    });
  },
  getAllWorkspaces: async (userId: number) => {
    return await prisma.workspace.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        invitations: {
          where: {
            status: "ACCEPTED",
          },
        },
        workspaceUsers: true,
      },
    });
  },

  createWorkspace: async (userId: number, name: string, logo?: string) => {
    return await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name,
          logo,
          ownerId: userId,
        },
      });

      await tx.workspaceUser.create({
        data: {
          workspaceId: workspace.id,
          userId: userId,
        },
      });

      return workspace;
    });
  },

  modifyWorkspace: async (userId: number, workspaceId: number, data: { name: string; logo: string }) => {
    return await prisma.$transaction(async (tx) => {
      // Update workspace
      const workspace = await tx.workspace.update({
        where: {
          id: workspaceId,
          ownerId: userId,
        },
        data: {
          name: data.name,
          logo: data.logo,
        },
      });

      return workspace;
    });
  },

  dropWorkspace: async (userId: number, workspaceId: number) => {
    return await prisma.workspace.delete({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
    });
  },
};
