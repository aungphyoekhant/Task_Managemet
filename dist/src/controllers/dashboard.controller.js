import { dashboardService } from "../services/dashboard.service.js";
import { authService } from "../services/auth.service.js";
// 🌐 1. ALL WORKSPACES STATS CONTROLLER
export const getAllWorkspacesStats = async (req, res) => {
    try {
        const userId = Number(res.locals.user?.id);
        if (!userId || isNaN(userId)) {
            return res.status(401).json({
                con: false,
                msg: "Unauthorized: Invalid or missing user authentication",
            });
        }
        // Call Dashboard Service with userId filter
        const data = await dashboardService.getAllWorkspacesStats(userId);
        return res.status(200).json({
            con: true,
            data,
        });
    }
    catch (error) {
        console.error("[All Workspaces Dashboard Controller Error]:", error);
        return res.status(500).json({
            con: false,
            msg: error?.message || "Internal Server Error",
        });
    }
};
// 🎯 2. SINGLE WORKSPACE STATS CONTROLLER
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Param and User validation
        const workspaceId = Number(req.params.workspaceId);
        const userId = Number(res.locals.user?.id);
        if (!workspaceId || isNaN(workspaceId) || !userId || isNaN(userId)) {
            return res.status(400).json({
                con: false,
                msg: "Invalid workspaceId or userId provided",
            });
        }
        // 2. Check Workspace Membership & Get Role
        const member = await authService.getWorkspaceUserRole({ userId, workspaceId });
        if (!member) {
            return res.status(403).json({
                con: false,
                msg: "Access Denied: You do not belong to this workspace",
            });
        }
        // 3. Fetch Service Data
        const data = await dashboardService.getDashboardStats({
            workspaceId,
            userId,
            role: member.role,
        });
        // 4. Return Standard Success Response
        return res.status(200).json({
            con: true,
            data,
        });
    }
    catch (error) {
        console.error("[Dashboard Controller Error]:", error);
        return res.status(500).json({
            con: false,
            msg: error?.message || "Internal Server Error",
        });
    } // ✅ ဤနေရာတွင် မလိုအပ်သော Comma (,) ကို ဖယ်ရှားပေးလိုက်ပါပြီ
};
