import { prisma } from "../lib/prisma.js";
export const invitationService = {
    processAcceptInvitation: async (userData, invitationData) => {
        return await prisma.$transaction(async (tx) => {
            await tx.workspaceUser.create({
                data: {
                    userId: userData.userId,
                    workspaceId: userData.workspaceId,
                    role: userData.role,
                },
            });
            await tx.invitation.update({
                where: { id: invitationData.id },
                data: { status: invitationData.status },
            });
        });
    },
    getInvitationById: async (id) => {
        return await prisma.invitation.findUnique({ where: { id } });
    },
    findUserByEmail: async (email) => {
        return await prisma.user.findUnique({ where: { email } });
    },
    getWorkspaceData: async (workspaceId, userId) => {
        const [member, workspace] = await Promise.all([
            prisma.workspaceUser.findFirst({
                where: {
                    workspaceId, userId,
                }
            }),
            prisma.workspace.findUnique({
                where: {
                    id: workspaceId
                }
            })
        ]);
        return { member, workspace };
    },
    getInvitations: async (workspaceId) => {
        return await prisma.invitation.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    },
    getInviteById: async (inviteId) => {
        return await prisma.invitation.findUnique({
            where: { id: inviteId },
        });
    },
    updateInvitationStatus: async (invitationId, status) => {
        return await prisma.invitation.update({
            where: { id: invitationId },
            data: { status },
        });
    }
};
