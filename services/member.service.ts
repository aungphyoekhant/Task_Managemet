import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

export const memberService = {
  getMemberRole: async (workspaceId: number, userId: number) => {
    return await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
      select: { role: true },
    });
  },

  // Workspace ပိုင်ရှင်ကို ရှာရန်
  getWorkspaceOwner: async (workspaceId: number) => {
    return await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
  },

  // Member ကို ဖျက်ရန်
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
