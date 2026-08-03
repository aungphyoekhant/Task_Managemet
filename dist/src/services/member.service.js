import { prisma } from "../lib/prisma.js";
import { Role } from "../../generated/prisma/client.js";
export const memberService = {
    getMemberRole: async (workspaceId, userId) => {
        return await prisma.workspaceUser.findFirst({
            where: { workspaceId, userId },
            select: { role: true },
        });
    },
    getWorkspaceOwner: async (workspaceId) => {
        return await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { ownerId: true },
        });
    },
    deleteMember: async (workspaceId, userId) => {
        return await prisma.workspaceUser.deleteMany({
            where: { workspaceId, userId },
        });
    },
    // Permission စစ်ဆေးသည့် Logic (Clean & Reusable)
    canDelete: (currentRole, isOwner, targetRole) => {
        if (isOwner)
            return true;
        if (currentRole === Role.ADMIN && targetRole === Role.MEMBER)
            return true;
        return false;
    },
};
