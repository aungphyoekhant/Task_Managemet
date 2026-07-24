import { Request, Response } from "express";
import { workspaceUserService } from "../services/workspace-user.service.js";
import { authService } from "../services/auth.service.js";
import { getWrokspaceUserValidator } from "../validators/workspaceuserauth.js";

export const workspaceUserController = {
  getWorkspaceUsers: async (req: Request, res: Response) => {
    try {
      const userId = Number(res.locals.user.id);
      const workspaceId = Number(req.params.workspaceId);

      const {error, value} = getWrokspaceUserValidator.validate({
        userId,
        workspaceId
      })

      console.log(value)

      if(error){
        return res.status(400).json({con : false, msg : error.details[0].message })
      }

      const data = await authService.getWorkspaceUserRole({ userId, workspaceId });

      console.log(data)

      if (!data) {
        return res.status(404).json({ con: false, msg: "Workspace not found" });
      }

      // if (data.role !== "OWNER" && data.role !== "ADMIN") {
      //   return res.status(403).json({ con: false, msg: "Access denied: You don't have permission" });
      // }

      // if (isNaN(workspaceId)) {
      //   return res.status(400).json({ con: false, msg: "Invalid workspace ID" });
      // }

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
