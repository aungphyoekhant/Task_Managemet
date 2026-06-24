import { Request, Response } from "express";
import { workspaceInvitedService } from "../services/workspaceInvitedServices";

export const workspaceInvitedController = {
  inviteUser: async (req: Request, res: Response) => {
    try {
      const { workspaceId, email, role } = req.body;
      const user = res.locals.user;

      if (!workspaceId || !email || !role) {
        return res.status(400).json({ con: false, msg: "Missing fields" });
      }

      const invitation = await workspaceInvitedService.inviteUser(user.id, Number(workspaceId), email, role);

      res.status(201).json({ con: true, msg: "Invitation sent", data: invitation });
    } catch (error: any) {
      res.status(500).json({ con: false, msg: error.message });
    }
  },
};
