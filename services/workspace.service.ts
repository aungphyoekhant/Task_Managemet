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
    // return keyword ကို ထည့်ပေးပါ
    return await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId }, // သူကိုယ်တိုင်ပိုင်တဲ့ Workspace
          {
            workspaceUsers: {
              // ဒါမှမဟုတ် သူ Member အနေနဲ့ join ထားတဲ့ Workspace
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
        // workspaceUsers ကိုပါ include လုပ်ထားရင် data ပိုစုံပါမယ်
        workspaceUsers: true,
      },
    });
  },
  createWorkspace: async (userId: number, name: string, logo?: string) => {
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
