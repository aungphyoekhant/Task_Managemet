import { prisma } from "../lib/prisma";
import { UpdateInvitationPayload, AddMemberPayload } from "../types/global";

export const invitationService = {
  getInvitationById: async (id: number) => {
    return await prisma.invitation.findUnique({ where: { id } });
  },

  updateInvitationStatus: async (payload: UpdateInvitationPayload) => {
    return await prisma.invitation.update({
      where: { id: payload.id },
      data: { status: payload.status },
    });
  },

  addMember: async (data: AddMemberPayload) => {
    return await prisma.workspaceUser.create({
      data: {
        userId: data.userId,
        workspaceId: data.workspaceId,
        role: data.role,
      },
    });
  },

  processAcceptInvitation: async (memberData: AddMemberPayload, invitationUpdate: UpdateInvitationPayload) => {
    return await prisma.$transaction([
      prisma.workspaceUser.create({
        data: {
          userId: memberData.userId,
          workspaceId: memberData.workspaceId,
          role: memberData.role,
        },
      }),
      prisma.invitation.update({
        where: { id: invitationUpdate.id },
        data: { status: invitationUpdate.status },
      }),
    ]);
  },
};
