import { Request, Response } from "express";
import { invitationService } from "../services/workspaceInvitedServices";

export const workspaceInvitedController = {
  inviteUser: async (req: Request, res: Response) => {
    try {
      const { workspaceId, email, role } = req.body;
      const user = res.locals.user;

      if (!workspaceId || !email || !role) {
        return res.status(400).json({ con: false, msg: "Missing required fields" });
      }

      const result = await invitationService.inviteUser(user.id, Number(workspaceId), email, role);

      return res.status(201).json({
        con: true,
        msg: "Invitation sent successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("DEBUG_ERROR:", error);
      console.log(error);

      const errorMessage = error?.message || "An internal server error occurred";
      return res.status(500).json({ con: false, msg: errorMessage });
    }
  },
};
