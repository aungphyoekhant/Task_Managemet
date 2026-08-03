import { prisma } from "../lib/prisma.js";
import { auditService } from "./audit.service.js";
import { io } from "../index.js";
export const workspaceUserService = {
    getWorkspaceUsers: async (workspaceId) => {
        return await prisma.workspaceUser.findMany({
            where: {
                workspaceId: workspaceId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                name: true,
                                avatar: true,
                                jobTitle: true,
                            },
                        },
                    },
                },
            },
        });
    },
    removeWorkspaceUser: async (workspaceId, userId) => {
        return await prisma.$transaction(async (tx) => {
            const workspaceUser = await tx.workspaceUser.findUnique({
                where: {
                    userId_workspaceId: {
                        workspaceId: workspaceId,
                        userId: userId,
                    },
                },
            });
            if (!workspaceUser) {
                throw new Error("User not found in this workspace");
            }
            const deletedWorkspaceUser = await tx.workspaceUser.delete({
                where: {
                    userId_workspaceId: {
                        workspaceId: workspaceId,
                        userId: userId,
                    },
                },
            });
            await tx.projectUser.deleteMany({
                where: {
                    workspaceId: workspaceId,
                    userId: userId,
                },
            });
            await tx.taskUser.deleteMany({
                where: {
                    workspaceId: workspaceId,
                    userId: userId,
                },
            });
            const notification = await tx.notification.create({
                data: {
                    workspaceId: workspaceId,
                    userId: userId,
                    message: `You have been removed from the workspace.`,
                },
            });
            await tx.userNoti.create({
                data: {
                    userId: userId,
                    notificationId: notification.id,
                    message: `You have been removed from the workspace.`,
                }
            });
            io.emit(`notification::${userId}`, {
                message: `You have been removed from the workspace.`,
            });
            await auditService.ActivityLog({
                userId: userId,
                action: "REMOVE_WORKSPACE_USER",
                entityType: "WORKSPACE",
                entityId: workspaceId,
            });
            return deletedWorkspaceUser;
        });
    }
};
