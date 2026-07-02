import { Request, Response } from "express";
import { activityService } from "../services/activity.service";

export const activityController = {
  getActivityLogs: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      if (user.role !== "OWNER" && user.role !== "ADMIN") {
        return res.status(403).json({ con: false, msg: "Access denied: You don't have permission" });
      }
      const workspaceId = Number(req.params.workspaceId);

      if (isNaN(workspaceId)) {
        return res.status(400).json({ con: false, msg: "Invalid workspace ID" });
      }

      const logs = await activityService.getActivityLogs(workspaceId);

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
