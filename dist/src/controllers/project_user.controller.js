import { projectUserService } from "../services/project_user.service.js";
import { authService } from "../services/auth.service.js";
import { addProjectMemberValidator, removeMemberValidator } from "../validators/projectuser-auth.js";
export const projectUserController = {
    addMember: async (req, res) => {
        try {
            // 1. req.body ကို Validation စစ်ပါ
            const { error, value } = addProjectMemberValidator.validate(req.body);
            if (error) {
                return res.status(400).json({ con: false, msg: error.details[0].message });
            }
            // 2. req.locals မှ User ID ရယူပါ
            const addedById = Number(res.locals.user?.id);
            if (!addedById) {
                return res.status(401).json({ con: false, msg: "Unauthorized: No user ID found" });
            }
            // 3. workspaceId နှင့် projectId တို့ကို req.params (သို့မဟုတ် req.body) မှ မှန်ကန်စွာ ရယူပါ
            const workspaceId = Number(req.params.workspaceId || value.workspaceId);
            const projectId = Number(req.params.projectId || value.projectId);
            const { userId, userIds, role } = value;
            if (!workspaceId || !projectId) {
                return res.status(400).json({ con: false, msg: "Invalid Workspace ID or Project ID" });
            }
            // 4. Target User IDs များကို Array ပြုလုပ်ပါ
            let targetUserIds = [];
            if (Array.isArray(userIds) && userIds.length > 0) {
                targetUserIds = userIds.map((id) => Number(id));
            }
            else if (userId) {
                targetUserIds = [Number(userId)];
            }
            if (targetUserIds.length === 0) {
                return res.status(400).json({ con: false, msg: "Please provide userId or userIds array" });
            }
            // 5. Current User ရဲ့ Workspace Role ကို စစ်ဆေးပါ
            const actionUserRoleData = await authService.getWorkspaceUserRole({
                userId: addedById,
                workspaceId,
            });
            // Enums / Uppercase-Lowercase မမှားရအောင် .toUpperCase() ထည့်သွင်းထားပါသည်
            const currentRole = actionUserRoleData?.role?.toUpperCase();
            if (currentRole !== "OWNER" && currentRole !== "ADMIN") {
                return res.status(403).json({
                    con: false,
                    msg: "Access denied: Only Owners and Admins can add members"
                });
            }
            // 6. Target Users ထဲမှာ အခြား Workspace Owner ပါမပါ စစ်ဆေးပါ
            for (const tUserId of targetUserIds) {
                const isSelfAssign = addedById === tUserId;
                if (!isSelfAssign) {
                    const targetUserRoleData = await authService.getWorkspaceUserRole({
                        userId: tUserId,
                        workspaceId,
                    });
                    if (targetUserRoleData?.role?.toUpperCase() === "OWNER") {
                        return res.status(400).json({
                            con: false,
                            msg: `Cannot assign another owner (User ID: ${tUserId}) to the project`,
                        });
                    }
                }
            }
            // 7. Service သို့ ပို့မည့် Parameter Order ကို သေချာ စစ်ဆေးပါ
            // (အကယ်၍ Service signature က projectId ကို ရှေ့ကလိုချင်ပါက ပြောင်းပေးပါ)
            const newMembers = await projectUserService.addMember(workspaceId, projectId, targetUserIds, addedById, role);
            return res.status(201).json({
                con: true,
                msg: targetUserIds.length > 1 ? "Members added successfully" : "Member added successfully",
                data: newMembers,
            });
        }
        catch (error) {
            console.error("Add Member Error:", error);
            return res.status(400).json({ con: false, msg: error.message || "Failed to add member" });
        }
    },
    getAllProjectMembers: async (req, res) => {
        try {
            const workspaceId = Number(req.params.workspaceId);
            const projectId = Number(req.params.projectId);
            const userId = Number(res.locals.user.id);
            const members = await projectUserService.getMembersByProject(workspaceId, projectId, userId);
            if (!members)
                return res.status(404).json({ con: false, msg: "Members not found" });
            return res.status(200).json({ con: true, msg: "Members retrieved successfully", data: members });
        }
        catch (error) {
            return res.status(500).json({
                con: false,
                msg: "Server Error",
                details: error,
            });
        }
    },
    removeMember: async (req, res) => {
        try {
            const { error } = removeMemberValidator.validate(req.params);
            if (error) {
                return res.status(400).json({ con: false, msg: error.details[0].message });
            }
            const projectUserId = Number(req.params.projectUserId);
            const workspaceId = Number(req.params.workspaceId);
            const userId = Number(res.locals.user.id);
            const projectId = Number(req.params.projectId);
            if (isNaN(projectUserId) || !projectUserId) {
                return res.status(400).json({
                    con: false,
                    msg: "Invalid or missing projectUserId parameter"
                });
            }
            if (!userId) {
                return res.status(401).json({ con: false, msg: "Unauthorized: No user ID found" });
            }
            await projectUserService.removeMember(workspaceId, projectId, projectUserId, userId);
            return res.status(200).json({
                con: true,
                msg: "Member removed successfully"
            });
        }
        catch (error) {
            console.error("Remove Member Error:", error);
            if (error.message.includes("Access denied")) {
                return res.status(403).json({ con: false, msg: error.message });
            }
            if (error.message.includes("Member not found")) {
                return res.status(404).json({ con: false, msg: error.message });
            }
            return res.status(500).json({
                con: false,
                msg: error.message || "Failed to remove member"
            });
        }
    },
};
