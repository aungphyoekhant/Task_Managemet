import { Request, Response } from "express";
import { updateRoleServices } from "../services/update_role.service";
import { authService } from "../services/auth.service";
import { updateRoleValidator } from "../validators/updaterole";

export const updateRoleController = {
  updateRole: async (req: Request, res: Response) => {
    try {

      console.log(req.body)
      console.log(req.params)

      const { error: paramsError } = updateRoleValidator.params.validate(req.params);


      const { error: bodyError, value } = updateRoleValidator.body.validate(req.body);

      if (paramsError) {
        return res.status(400).json({ con: false, msg: paramsError.details[0].message });
      }
      if (bodyError) {
        return res.status(400).json({ con: false, msg: bodyError.details[0].message });
      }


      const { workspaceId, userId } = req.params;
      const { newRole } = value; 

      const currentUserId = Number(res.locals.user.id);
      const workspace = await authService.getWorkspaceById(Number(workspaceId));

      if (!workspace) {
        return res.status(404).json({ con: false, msg: "Workspace not found" });
      }

      if (workspace.ownerId !== currentUserId) {
        return res.status(403).json({ con: false, msg: "Access Denied: Only Owner can update roles" });
      }

      const targetUser = await authService.getWorkspaceUserRole({
        userId: Number(userId),
        workspaceId: Number(workspaceId),
      });

      if (!targetUser) {
        return res.status(404).json({ con: false, msg: "Target user not found in this workspace" });
      }

      if (targetUser.role === "OWNER") {
        return res.status(403).json({ con: false, msg: "Cannot modify an Owner's role" });
      }

      await updateRoleServices.updateRole(Number(workspaceId), Number(userId), newRole);

      return res.status(200).json({
        con: true,
        msg: "Role updated successfully",
        data: { role: newRole },
      });
    } catch (error) {
      console.error("Update Role Error:", error);
      return res.status(500).json({ con: false, msg: "Server Error" });
    }
  },
};