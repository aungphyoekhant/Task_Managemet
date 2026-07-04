import { Request, Response } from "express";
import { updateRoleServices } from "../services/update_role.service";
import { authService } from "../services/auth.service";

export const updateRoleController = {
  updateRole: async (req: Request, res: Response) => {
    try {
      const { workspaceId, userId } = req.params;
      const { newRole } = req.body;

      // ၁။ Validation (Role string ဟုတ်မဟုတ်)
      if (!newRole || typeof newRole !== "string") {
        return res.status(400).json({ con: false, msg: "Role is required and must be a string" });
      }

      const roleUpper = newRole.toUpperCase();

      // ၂။ Role Check (Owner ကို တိုက်ရိုက် Assign လုပ်ခွင့်မပေးပါ)
      const allowedRoles = ["ADMIN", "MEMBER"];
      if (!allowedRoles.includes(roleUpper)) {
        return res.status(400).json({ con: false, msg: "Invalid role. Only ADMIN or MEMBER allowed." });
      }

      if (!workspaceId || !userId) {
        return res.status(400).json({ con: false, msg: "WorkspaceId and UserId are required" });
      }

      // ၃။ Authorization (Workspace Owner ဟုတ်မဟုတ် စစ်ရန်)
      const currentUserId = Number(res.locals.user.id);
      const workspace = await authService.getWorkspaceById(Number(workspaceId));

      if (!workspace) {
        return res.status(404).json({ con: false, msg: "Workspace not found" });
      }

      if (workspace.ownerId !== currentUserId) {
        return res.status(403).json({ con: false, msg: "Access Denied: Only Owner can update roles" });
      }

      // ၄။ Target User ကို စစ်ဆေးရန် (Owner ကို ပြင်ခွင့်မရှိ)
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

      await updateRoleServices.updateRole(Number(workspaceId), Number(userId), roleUpper);

      return res.status(200).json({
        con: true,
        msg: "Role updated successfully",
        data: { role: roleUpper },
      });
    } catch (error) {
      console.error("Update Role Error:", error);
      return res.status(500).json({ con: false, msg: "Server Error" });
    }
  },
};
