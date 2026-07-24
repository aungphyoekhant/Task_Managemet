import { prisma } from "../lib/prisma.js"
import { Role } from "../../generated/prisma/client.js";

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
        notifications: true,
        projectUsers: true,
        invitations: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
    });
  },

  getAllWorkspace: async (userId: number) => {
    return await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            workspaceUsers: {
              some: { userId: userId },
            },
          },
        ],
      },
      include: {
        projects: true,
        tasks: true,
        notifications: true,
        invitations: {
          where: { status: "ACCEPTED" },
        },
        workspaceUsers: true,
        activityLogs: true,
      },
    });
  },

  getAllWorkspaceByUserId: async (userId: number) => {
    return await prisma.workspaceUser.findMany({
      where: {
        userId: userId,
      },
     include: {
       workspace: {
           include: {
               _count: {
                   select: {
                        projects: true,
                         tasks: true,
         }
      }
    }
  }
},
    });
  },

  createWorkspace: async (userId : number, name: string, logo?: string) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name,
            logo,
            ownerId: userId,
          },
        });
        console.log("Workspace Created ID:", workspace.id);
        console.log("Workspace Name : ", name)
        console.log("ownerId", userId)

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
