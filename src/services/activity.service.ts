import { prisma } from "../lib/prisma.js";

export const activityService = {
  getActivityLogsByUserId: async (userId: number) => {
  return await prisma.activityLog.findMany({
    where: {
      userId: userId, 
    },
    orderBy: {
      createdAt: 'desc',
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

  deleteAllActivityLogsByUserId : async (userId: number) => {
    return await prisma.activityLog.deleteMany({
      where: {
        userId: userId,
      },
    });
  },

};