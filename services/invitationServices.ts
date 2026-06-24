import { prisma } from "../lib/prisma";
import { InvitationStatus } from "../generated/prisma/client";

export const invitationService = {
  getInvitationById: async (id: number) => {
    return await prisma.invitation.findUnique({ where: { id } });
  },

  updateInvitationStatus: async (id: number, status: string) => {
    return await prisma.invitation.update({
      where: { id },
      data: { status: status as InvitationStatus },
    });
  },

  addMember: async (userId: number, workspaceId: number, role: string) => {
    return await prisma.workspaceUser.create({
      data: { userId, workspaceId, role },
    });
  },
};
