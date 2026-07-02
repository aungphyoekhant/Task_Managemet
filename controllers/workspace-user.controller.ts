import { Request, Response } from "express";
import { workspaceUserService } from "../services/workspace-user.service";

export const workspaceUserController = {
  getWorkspaceUsers: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      if (user.role !== "OWNER" && user.role !== "ADMIN") {
        return res.status(403).json({ con: false, msg: "Access denied: You don't have permission" });
      }

      const workspaceId = Number(req.params.workspaceId);

      if (isNaN(workspaceId)) {
        return res.status(400).json({ con: false, msg: "Invalid workspace ID" });
      }

      const users = await workspaceUserService.getWorkspaceUsers(workspaceId);

      return res.json({
        con: true,
        msg: "Workspace users fetched successfully",
        data: users,
      });
    } catch (error: any) {
      console.error("Fetch Users Error:", error);
      return res.status(500).json({ con: false, msg: "Error fetching workspace users" });
    }
  },
};
