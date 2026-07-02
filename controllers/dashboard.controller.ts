import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { id: userId, role } = res.locals.user;

    const data = await dashboardService.getDashboardStats(Number(userId), role, workspaceId ? Number(workspaceId) : undefined);

    return res.status(200).json({ con: true, data });
  } catch (error: any) {
    if (error.message === "ACCESS_DENIED") {
      return res.status(403).json({ con: false, msg: "Access Denied" });
    }
    if (error.message === "WORKSPACE_ID_REQUIRED") {
      return res.status(400).json({ con: false, msg: "Workspace ID required" });
    }
    return res.status(500).json({ con: false, msg: error.message });
  }
};
