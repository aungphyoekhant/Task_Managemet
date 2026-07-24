import { prisma } from "../lib/prisma.js";
import { Role } from "../../generated/prisma/client.js";

export const memberService = {
  getMemberRole: async (workspaceId: number, userId: number) => {
    return await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
      select: { role: true },
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

  // Permission စစ်ဆေးသည့် Logic (Clean & Reusable)
  canDelete: (currentRole: Role, isOwner: boolean, targetRole: Role): boolean => {
    if (isOwner) return true;
    if (currentRole === Role.ADMIN && targetRole === Role.MEMBER) return true;
    return false;
  },
};
