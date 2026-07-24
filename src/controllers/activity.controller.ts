import { Request, Response } from "express";
import { activityService } from "../services/activity.service.js";
import { authService } from "../services/auth.service.js";

export const activityController = {
  getActivityLogs: async (req: Request, res: Response) => {
    try {
      const userId = Number(res.locals.user.id);
      console.log("user id is : ", userId);
      
      const logs = await activityService.getActivityLogsByUserId(userId);

      return res.json({
        con: true,
        msg: "Activity logs fetched successfully",
        data: logs,
      });
    } catch (error: any) {
      console.error("Fetch Logs Error:", error);
      return res.status(500).json({ con: false, msg: "Error fetching logs" });
    }
  },
};
