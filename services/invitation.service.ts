import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

export const invitationService = {
  processAcceptInvitation: async (userData: { userId: number; workspaceId: number; role: string }, invitationData: { id: number; status: any }) => {
    return await prisma.$transaction(async (tx) => {
      await tx.workspaceUser.create({
        data: {
          userId: userData.userId,
          workspaceId: userData.workspaceId,
          role: userData.role as Role,
        },
      });

      await tx.invitation.update({
        where: { id: invitationData.id },
        data: { status: invitationData.status },
      });
    });
  },

  getInvitationById: async (id: number) => {
    return await prisma.invitation.findUnique({ where: { id } });
  },

  findUserByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
  },
};
