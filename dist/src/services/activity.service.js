import { prisma } from "../lib/prisma.js";
export const activityService = {
    getActivityLogsByUserId: async (userId) => {
        return await prisma.activityLog.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },
    deleteAllActivityLogsByUserId: async (userId) => {
        return await prisma.activityLog.deleteMany({
            where: {
                userId: userId,
            },
        });
    },
};
