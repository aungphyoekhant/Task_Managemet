import { prisma } from "../lib/prisma.js";
export const searchService = {
    async verifyWorkspaceAccess(workspaceId, userId) {
        const isMember = await prisma.workspaceUser.findFirst({
            where: { workspaceId, userId },
        });
        if (!isMember)
            throw new Error("UNAUTHORIZED_ACCESS");
    },
    searchProjects: async (workspaceId, q) => {
        return await prisma.project.findMany({
            where: {
                workspaceId,
                name: { contains: q, mode: "insensitive" },
            },
        });
    },
    searchTasksByTitle: async (workspaceId, projectId, userId, title) => {
        await searchService.verifyWorkspaceAccess(workspaceId, userId);
        return await prisma.task.findMany({
            where: { workspaceId, projectId, title: { contains: title, mode: "insensitive" } },
        });
    },
    searchTasksByStatus: async (workspaceId, projectId, userId, status) => {
        await searchService.verifyWorkspaceAccess(workspaceId, userId);
        return await prisma.task.findMany({
            where: { workspaceId, projectId, status },
        });
    },
    searchUsers: async (workspaceId, userId, q) => {
        return await prisma.workspaceUser.findMany({
            where: {
                workspaceId: Number(workspaceId),
                userId: Number(userId),
                user: {
                    OR: [
                        { profile: { name: { contains: q, mode: "insensitive" } } },
                        { email: { contains: q, mode: "insensitive" } },
                    ],
                },
            },
            include: { user: { include: { profile: true } } },
        });
    },
    searchWorkspaces: async (userId, q) => {
        return await prisma.workspace.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { ownerId: userId },
                            { workspaceUsers: { some: { userId: userId } } }
                        ]
                    },
                    {
                        name: { contains: q, mode: "insensitive" }
                    }
                ]
            },
        });
    },
    searchProjectUsers: async (workspaceId, projectId, q) => {
        return await prisma.projectUser.findMany({
            where: {
                projectId: projectId,
                project: {
                    workspaceId: workspaceId,
                },
                // Search text (q) ရှိမှသာ user condition filter ဝင်စေရန်
                ...(q
                    ? {
                        user: {
                            OR: [
                                { profile: { name: { contains: q, mode: "insensitive" } } },
                                { email: { contains: q, mode: "insensitive" } },
                            ],
                        },
                    }
                    : {}),
            },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
    },
};
