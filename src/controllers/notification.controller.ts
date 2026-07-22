import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
export const notificationController = {
  markNotificationAsRead: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);
    const notificationId = Number(req.params.id);

    if (!notificationId) {
      return res.status(400).json({ con: false, msg: "Notification id is required" });
    }

    try {
      await notificationService.markRead(userId, notificationId);

      return res.status(200).json({
        con: true,
        msg: "Notification marked as read",
      });
    } catch (error: any) {
      console.error("Mark Read Error:", error);

      return res.status(500).json({
        con: false,
        msg: error.message || "Error updating notification",
      });
    }
  },

  markAllAsRead: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);

    try {
      const result = await notificationService.markAllAsRead(userId);

      return res.status(200).json({
        con: true,
        msg: `Successfully marked ${result.count} notifications as read`,
        updatedCount: result.count,
      });
    } catch (error: any) {
      console.error("Mark All Read Error:", error);
      return res.status(500).json({
        con: false,
        msg: "Error updating notifications",
      });
    }
  },

  getNotifications: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    try {
      const { notifications, unreadCount } = await notificationService.getNotifications(userId, page, limit);

      return res.status(200).json({
        con: true,
        data: notifications,
        unreadCount: unreadCount,
        meta: { page, limit },
      });
    } catch (error) {
      console.error("Get Notifications Error:", error);
      return res.status(500).json({ con: false, msg: "Error fetching notifications" });
    }
  },

  deleteNotification: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);
    const notificationId = Number(req.params.id);

    if (!notificationId) {
      return res.status(400).json({ con: false, msg: "Notification id is required" });
    }

    try {
      await notificationService.deleteNotification(userId, notificationId);

      return res.status(200).json({
        con: true,
        msg: "Notification deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete Notification Error:", error);
      return res.status(500).json({
        con: false,
        msg: error.message || "Error deleting notification",
      });
    }
  },

  deleteAllNotifications: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);

    try {
      await notificationService.deleteAllNotifications(userId);

      return res.status(200).json({
        con: true,
        msg: "All notifications deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete All Notifications Error:", error);
      return res.status(500).json({
        con: false,
        msg: "Error deleting all notifications",
      });
    }
  },
};
