import { prisma } from "../lib/prisma.js"

export const userNotiService = {
  getNotifications: async (userId: number, workspaceId: number) => {
    return await prisma.userNoti.findMany({
      where: {
        userId,
        notification: { workspaceId },
      },
      include: { notification: true },
      orderBy: { id: "desc" },
    });
  },

  markRead: async (userId: number, userNotiId: number) => {
    return await prisma.userNoti.update({
      where: {
        id: userNotiId,
        userId: userId,
      },
      data: {
        isRead: true,
      },
    });
  },

  deleteNotification: async (userNotiId: number) => {
    return await prisma.userNoti.delete({
      where: { id: userNotiId },
    });
  },

  deleteAllNotifications: async (userId: number, workspaceId: number) => {
    return await prisma.userNoti.deleteMany({
      where: {
        userId,
        notification: { workspaceId },
      },
    });
  },
};
