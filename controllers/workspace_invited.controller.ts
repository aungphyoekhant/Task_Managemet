import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { invitationService } from "../services/workspace_invitation.service";

export const workspaceInvitedController = {
  inviteUser: async (req: Request, res: Response) => {
    try {
      const { workspaceId, email, role } = req.body;
      const user = res.locals.user;
      const targetRole = role?.toUpperCase();

      console.log(targetRole);

      if (!workspaceId || !email || !role) {
        return res.status(400).json({ con: false, msg: "Missing required fields" });
      }

      const [member, workspace] = await Promise.all([
        prisma.workspaceUser.findFirst({
          where: { workspaceId: Number(workspaceId), userId: user.id },
        }),
        prisma.workspace.findUnique({
          where: { id: Number(workspaceId) },
        }),
      ]);

      if (!workspace) return res.status(404).json({ con: false, msg: "Workspace not found" });

      const isOwner = member?.role === "OWNER";
      const isAdmin = member?.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ con: false, msg: "Unauthorized: You don't have permission" });
      }

      if (isAdmin && (targetRole === "ADMIN" || targetRole === "OWNER")) {
        return res.status(403).json({ con: false, msg: "Admin cannot invite another Admin or Owner" });
      }

      if (isOwner && targetRole === "OWNER") {
        return res.status(403).json({ con: false, msg: "You cannot invite another owner" });
      }

      const result = await invitationService.inviteUser(user.id, Number(workspaceId), email, role);

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
