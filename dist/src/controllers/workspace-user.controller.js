import { workspaceUserService } from "../services/workspace-user.service.js";
import { authService } from "../services/auth.service.js";
import { getWrokspaceUserValidator } from "../validators/workspaceuserauth.js";
export const workspaceUserController = {
    getWorkspaceUsers: async (req, res) => {
        try {
            const userId = Number(res.locals.user.id);
            const workspaceId = Number(req.params.workspaceId);
            const { error, value } = getWrokspaceUserValidator.validate({
                userId,
                workspaceId
            });
            if (error) {
                return res.status(400).json({ con: false, msg: error.details[0].message });
            }
            const data = await authService.getWorkspaceUserRole({ userId, workspaceId });
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
        }
        catch (error) {
            console.error("Fetch Users Error:", error);
            return res.status(500).json({ con: false, msg: "Error fetching workspace users" });
        }
    },
    removeWorkspaceUser: async (req, res) => {
        try {
            const workspaceId = Number(req.params.workspaceId);
            const userId = Number(req.params.userId);
            if (isNaN(workspaceId) || isNaN(userId)) {
                return res.status(400).json({ success: false, message: "Invalid workspace ID or user ID" });
            }
            // Service ကိုခေါ်ပြီး WorkspaceUser, ProjectUser, TaskUser များကို ရှင်းလင်းမည်
            await workspaceUserService.removeWorkspaceUser(workspaceId, userId);
            return res.status(200).json({
                success: true,
                message: "Member removed from workspace successfully, and related tasks cleaned up.",
            });
        }
        catch (error) {
            console.error("Remove workspace user error:", error);
            if (error.message === "User not found") {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    },
};
