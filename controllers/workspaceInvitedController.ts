import { Request, Response } from "express";
import { workspaceInvitedService } from "../services/workspaceInvitedServices";

import { Role } from "../generated/prisma/client";

export const workspaceInvitedController = {
  inviteUser: async (req: Request, res: Response) => {
    try {
      const { workspaceId, email, role } = req.body;
      const user = res.locals.user;

      if (!workspaceId || !email || !role) {
        return res.status(400).json({ con: false, msg: "WorkspaceId, email, and role are required" });
      }

      if (!Object.values(Role).includes(role)) {
        return res.status(400).json({ con: false, msg: "Invalid role provided" });
      }

      if (role === Role.OWNER) {
        return res.status(403).json({ con: false, msg: "Cannot invite as OWNER" });
      }

      if (email === "aungphyokhant.official@gmail.com") {
        return res.status(400).json({ con: false, msg: "Cannot invite as OWNER Email" });
      }

      const invitation = await workspaceInvitedService.inviteUser(user.id, Number(workspaceId), email, role as Role);

      res.status(201).json({
        con: true,
        msg: "Invitation sent successfully",
        data: invitation,
      });
    } catch (error: any) {
      if (error.message === "Workspace not found or unauthorized") {
        return res.status(403).json({ con: false, msg: error.message });
      }
      res.status(500).json({ con: false, msg: error.message || "Failed to invite user" });
    }
  },

  acceptInvitation: async (req: Request, res: Response) => {
    try {
      const { invitationId } = req.params;
      const user = res.locals.user;

      if (!invitationId) {
        return res.status(400).json({ con: false, msg: "InvitationId is required" });
      }

      await workspaceInvitedService.acceptInvitation(Number(invitationId), user.id);

      res.status(200).json({
        con: true,
        msg: "Successfully joined the workspace",
      });
    } catch (error: any) {
      res.status(400).json({
        con: false,
        msg: error.message || "Failed to accept invitation",
      });
    }
  },
};
