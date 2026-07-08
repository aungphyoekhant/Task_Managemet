import { Request, Response } from "express";
import { workspaceInvitationService } from "../services/workspace_invitation.service";
import { invitationService } from "../services/invitation.service";
import { workspaceInviteValidator } from "../validators/workspaceInvite-auth";


export const workspaceInvitedController = {
  inviteUser: async (req: Request, res: Response) => {
    try {
      const { workspaceId, email, role } = req.body;
      const userId = Number(res.locals.user.id);
      const targetRole = role?.toUpperCase();

      const {error, value}= workspaceInviteValidator.validate({
        workspaceId,
        email,
        role,
      })

      if(error){
        return res.status(400).json({con : false, msg : error.details[0].message})
      }

      const data = await invitationService.getWorkspaceData(Number(workspaceId), userId);

      
      if (!data || !data.workspace || !data.member) {
        return res.status(404).json({ con: false, msg: "Workspace or Membership not found" });
      }

      const { member, workspace } = data;

      const isOwner = member.role === "OWNER";
      const isAdmin = member.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ con: false, msg: "Unauthorized: You don't have permission" });
      }

      if (isAdmin && (targetRole === "ADMIN" || targetRole === "OWNER")) {
        return res.status(403).json({ con: false, msg: "Admin cannot invite another Admin or Owner" });
      }

      if (isOwner && targetRole === "OWNER") {
        return res.status(403).json({ con: false, msg: "You cannot invite another owner" });
      }

      const result = await workspaceInvitationService.inviteUser(userId, Number(workspaceId), email, role);

      return res.status(201).json({
        con: true,
        msg: "Invitation sent successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("INVITE_ERROR:", error);
      return res.status(500).json({ con: false, msg: error.message || "Internal server error" });
    }
  },
};
