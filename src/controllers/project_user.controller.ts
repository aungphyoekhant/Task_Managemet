import { Request, Response } from "express";
import { projectUserService } from "../services/project_user.service.js";
import { authService } from "../services/auth.service.js";
import { addProjectMemberValidator, removeMemberValidator } from "../validators/projectuser-auth.js";

export const projectUserController = {

 addMember: async (req : Request, res : Response) => {
    console.log(res.locals.user);
    try {
      // 1. Validate request body with Joi
      const { error, value } = addProjectMemberValidator.validate(req.body);

      console.log("Project User is : ", value);

      if (error) {
        return res.status(400).json({ con: false, msg: error.details[0].message });
      }

      const addedById = Number(res.locals.user.id);
      if (!addedById) {
        return res.status(401).json({ con: false, msg: "Unauthorized: No user ID found" });
      }

      // **အရေးကြီးချက်**: req.body အစား Joi စစ်ပြီးသား `value` မှ တန်ဖိုးများကို ယူသုံးပါ
      const { projectId, userId, workspaceId } = value;

      // 2. Action လုပ်သူ၏ Workspace Role ကို စစ်ဆေးခြင်း
      const actionUserRoleData = await authService.getWorkspaceUserRole({ 
        userId: addedById, 
        workspaceId: Number(workspaceId) 
      });

      console.log("Action User Role:", actionUserRoleData?.role);

      if (actionUserRoleData?.role !== "OWNER" && actionUserRoleData?.role !== "ADMIN") {
        return res.status(403).json({ con: false, msg: "Access denied: Only Owners and Admins can add members" });
      }

      // 3. (Optional လုံခြုံရေး) OWNER က အခြား Owner များကို Assign လုပ်ခွင့်မပေးလိုလျှင် စစ်ဆေးရန်
      const targetUserRoleData = await authService.getWorkspaceUserRole({ 
        userId: Number(userId), 
        workspaceId: Number(workspaceId) 
      });

      if (targetUserRoleData?.role === "OWNER") {
        return res.status(400).json({ con: false, msg: "Cannot assign another owner to the project" });
      }

      // 4. Project Member အသစ် ထည့်သွင်းခြင်း
      const newMember = await projectUserService.addMember(
        Number(workspaceId),
        Number(projectId),
        Number(userId),
        addedById,
      );

      console.log("New Member Added:", newMember);

      return res.status(201).json({ 
        con: true, 
        msg: "Member added successfully", 
        data: newMember 
      });

    } catch (error : any) {
      console.error("Add Member Error:", error);
      return res.status(400).json({ con: false, msg: error.message || "Failed to add member" });
    }
  },

  getAllProjectMembers: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = Number(res.locals.user.id)

      const members = await projectUserService.getMembersByProject(Number(projectId), userId);

      if (!members) return res.status(404).json({ con: false, msg: "Members not found" });

      return res.status(200).json({ con: true, msg: "Members retrieved successfully", data: members });
    } catch (error: any) {
      return res.status(500).json({
        con: false,
        msg: "Server Error",
        details: error,
      });
    }
  },

  removeMember: async (req: Request, res: Response) => {
    try {
      const { error } = removeMemberValidator.validate(req.params);

      if (error) {
        return res.status(400).json({ con: false, msg: error.details[0].message });
      }

      const { projectUserId } = req.params;
      const actorUserId = Number(res.locals.user.id);

      if (!actorUserId) {
        return res.status(401).json({ con: false, msg: "Unauthorized: No user ID found" });
      }

      console.log(`[Controller] Removing projectUserId: ${projectUserId} by actorUserId: ${actorUserId}`);

    
      await projectUserService.removeMember(Number(projectUserId), actorUserId);

      return res.status(200).json({ 
        con: true, 
        msg: "Member removed successfully" 
      });

    } catch (error: any) {
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
