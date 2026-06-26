import { prisma } from "../lib/prisma";

export const memberService = {
  getMemberRole: async (workspaceId: number, userId: number) => {
    return await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
    });
  },

  getWorkspaceOwner: async (workspaceId: number) => {
    return await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
  },

  deleteMember: async (workspaceId: number, userId: number) => {
    return await prisma.workspaceUser.deleteMany({
      where: { workspaceId, userId },
    });
  },
};
