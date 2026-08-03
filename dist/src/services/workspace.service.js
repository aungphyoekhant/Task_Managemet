import { prisma } from "../lib/prisma.js";
import { Role } from "../../generated/prisma/client.js";
export const workspaceService = {
    getWorkspaceById: async (userId, workspaceId) => {
        return await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                OR: [
                    { ownerId: userId },
                    { workspaceUsers: { some: { userId: userId } } }
                ]
            },
            include: {
                projects: true,
                workspaceUsers: true,
                tasks: true,
                notifications: true,
                projectUsers: true,
                invitations: {
                    where: {
                        status: "ACCEPTED",
                    },
                },
            },
        });
    },
    getAllWorkspace: async (userId) => {
        return await prisma.workspace.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        workspaceUsers: {
                            some: { userId: userId },
                        },
                    },
                ],
            },
            include: {
                projects: true,
                tasks: true,
                notifications: true,
                invitations: {
                    where: { status: "ACCEPTED" },
                },
                workspaceUsers: true,
            },
        });
    },
    getAllWorkspaceByUserId: async (userId) => {
        return await prisma.workspaceUser.findMany({
            where: {
                userId: userId,
            },
            include: {
                workspace: {
                    include: {
                        _count: {
                            select: {
                                projects: true,
                                tasks: true,
                            }
                        }
                    }
                }
            },
        });
    },
    createWorkspace: async (userId, name, logo) => {
        try {
            return await prisma.$transaction(async (tx) => {
                const workspace = await tx.workspace.create({
                    data: {
                        name,
                        logo,
                        ownerId: userId,
                    },
                });
                const userRole = await tx.workspaceUser.create({
                    data: {
                        workspaceId: workspace.id,
                        userId: userId,
                        role: Role.OWNER,
                    },
                });
                return workspace;
            });
        }
        catch (error) {
            console.error("CRITICAL ERROR in createWorkspace:", error);
            throw error;
        }
    },
    modifyWorkspace: async (userId, workspaceId, data) => {
        return await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.update({
                where: {
                    id: workspaceId,
                    ownerId: userId,
                },
                data: {
                    name: data.name,
                    logo: data.logo,
                },
            });
            return workspace;
        });
    },
    dropWorkspace: async (userId, workspaceId) => {
        return await prisma.workspace.delete({
            where: {
                id: workspaceId,
                ownerId: userId,
            },
        });
    },
};
