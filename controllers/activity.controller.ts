import { Request, Response } from "express";
import { activityService } from "../services/activity.service";
import { authService } from "../services/auth.service";

export const activityController = {
  getActivityLogs: async (req: Request, res: Response) => {
    try {
      const userId = Number(res.locals.user.id);

      console.log("user id is : ", userId);

      const workspaceId = Number(req.params.workspaceId);
      console.log("Workspac Id is : ", workspaceId);

      const data = await authService.getWorkspaceUserRole({ userId, workspaceId });
      console.log(data);

      if (data?.role !== "OWNER" && data?.role !== "ADMIN") {
        return res.status(403).json({ con: false, msg: "Access denied: You don't have permission" });
      }

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
