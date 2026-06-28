import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

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
        projects: true,
      },
    });
  },

  createWorkspace: async (userId: number, name: string, logo?: string) => {
    try {
      return await prisma.$transaction(async (tx) => {
        console.log("Starting Workspace Creation...");

        const workspace = await tx.workspace.create({
          data: {
            name,
            logo,
            ownerId: userId,
          },
        });
        console.log("Workspace Created ID:", workspace.id);

        const userRole = await tx.workspaceUser.create({
          data: {
            workspaceId: workspace.id,
            userId: userId,
            role: Role.OWNER,
          },
        });

        console.log("Created User Role Object:", userRole);
        return workspace;
      });
    } catch (error) {
      console.error("CRITICAL ERROR in createWorkspace:", error);
      throw error;
    }
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
