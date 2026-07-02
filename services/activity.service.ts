import { prisma } from "../lib/prisma";
export const activityService = {
  getActivityLogs: async (workspaceId: number) => {
    return await prisma.activityLog.findMany({
      where: {
        workspaceId: workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    });
  },
};
