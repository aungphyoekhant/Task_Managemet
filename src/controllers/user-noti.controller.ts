import { Request, Response } from "express";
import { userNotiService } from "../services/user-noti.service";

export const userNotiController = {
  // Get
  getNotifications: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);
    const workspaceId = Number(req.query.workspaceId); // URL: /?workspaceId=1

    const data = await userNotiService.getNotifications(userId, workspaceId);

    res.status(200).json({ con: true, data });
  },

  // Read/Unread Update
  markNotificationAsRead: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);
    const userNotiId = Number(req.params.id); // URL param က id

    if (!userNotiId) {
      return res.status(400).json({ con: false, msg: "Notification id is required" });
    }

    try {
      await userNotiService.markRead(userNotiId, userId);

      return res.status(200).json({
        con: true,
        msg: "Notification marked as read",
      });
    } catch (error: any) {
      console.error("Mark Read Error:", error);

      return res.status(500).json({
        con: false,
        msg: "Error updating notification",
      });
    }
  },

  // Delete One
  deleteNotification: async (req: Request, res: Response) => {
    const { id } = req.params;
    await userNotiService.deleteNotification(Number(id));
    res.status(200).json({ con: true, msg: "Deleted successfully" });
  },

  // Delete All
  deleteAllNotifications: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id);
    const { workspaceId } = req.body;

    await userNotiService.deleteAllNotifications(userId, workspaceId);
    res.status(200).json({ con: true, msg: "All notifications deleted" });
  },
};
