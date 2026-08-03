import { prisma } from "../lib/prisma.js";
import { io } from "../index.js";
export const updateRoleServices = {
    updateRole: async (workspaceId, userId, newRole) => {
        const formattedRole = newRole.toUpperCase();
        const result = await prisma.workspaceUser.updateMany({
            where: { workspaceId, userId },
            data: { role: formattedRole },
        });
        if (result.count > 0) {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    workspaceId,
                    message: `Your role in workspace has been updated to "${formattedRole}"`,
                },
            });
            if (typeof io !== "undefined" && io) {
                io.emit(`notification::${userId}`, notification);
            }
        }
        return result;
    },
};
