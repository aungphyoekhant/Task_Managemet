import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { authService } from "../services/auth.service";
import { Role } from "../generated/prisma/client";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const userId = Number(res.locals.user.id);

    console.log("DEBUG: req.params:", req.params);
    console.log("DEBUG: req.query:", req.query);

    if (isNaN(workspaceId) || !userId) {
      return res.status(400).json({ con: false, msg: "Invalid request parameters" });
    }

    const member = await authService.getWorkspaceUserRole({ userId, workspaceId });

    if (!member) {
      return res.status(403).json({ con: false, msg: "Access Denied" });
    }

    const data = await dashboardService.getDashboardStats({
      workspaceId,
      userId,
      role: member.role as Role,
    });

    return res.status(200).json({ con: true, data });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ con: false, msg: "Internal Server Error" });
  }
};
