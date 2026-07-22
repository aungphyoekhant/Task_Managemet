import { prisma } from "../lib/prisma";
export const notificationService = {
  markRead: async (userId: number, notificationId: number) => {
    const updated = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
      },
      data: {
        isRead: true,
      },
    });

    if (updated.count === 0) {
      throw new Error("Notification not found or access denied");
    }

    return updated;
  },

  markAllAsRead: async (userId: number) => {
    return await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  },

  getNotifications: async (userId: number, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { notifications, unreadCount };
  },

  deleteNotification: async (userId: number, notificationId: number) => {
    return await prisma.notification.delete({
      where: { id: notificationId, userId },
    });
  },

  deleteAllNotifications: async (userId: number) => {
    return await prisma.notification.deleteMany({
      where: { userId },
    });
  },
};
