// controllers/invitation.controller.ts
import { Request, Response } from "express";
import { invitationService } from "../services/invitation.service";
import jwt from "jsonwebtoken";
import { InvitationTokenPayload } from "../types/global";

export const invitationController = {
  acceptInvitation: async (req: Request, res: Response) => {
    const { token } = req.body;

    console.log("-------------",token)

    const decoded = jwt.decode(token); 

console.log("Decoded Token Data:", decoded);

    if (!token || typeof token !== "string") {
      return res.status(400).json({ con: false, msg: "Token is required" });
    }

    try {
      const secret = process.env.INVITATION_SECRET;
      if (!secret) throw new Error("INVITATION_SECRET is not defined");

      const decoded = jwt.verify(token, secret) as InvitationTokenPayload;
      const { invitationId, email } = decoded;

      const invitation = await invitationService.getInvitationById(invitationId);
      if (!invitation || invitation.status !== "PENDING") {
        return res.status(400).json({ con: false, msg: "Invalid invitation" });
      }

      const existingUser = await invitationService.findUserByEmail(email);

      if (!existingUser) {
        return res.json({ con: true, action: "REGISTER", email, invitationId });
      }

      await invitationService.processAcceptInvitation(
        { userId: existingUser.id, workspaceId: invitation.workspaceId, role: invitation.role },
        { id: invitation.id, status: "ACCEPTED" },
      );

      return res.json({ con: true, msg: "Successfully joined!" });
    } catch (error) {
      return res.status(401).json({ con: false, msg: "Invalid or expired token" });
    }
  },

  rejectInvitation : async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ con: false, msg: "Token is required" });

  try {
    const secret = process.env.INVITATION_SECRET!;
    const decoded = jwt.verify(token, secret) as { invitationId: number };

    const invitation = await invitationService.getInvitationById(decoded.invitationId);
    if (!invitation || invitation.status !== "PENDING") {
      return res.status(400).json({ con: false, msg: "Invalid or already processed invitation" });
    }

    await invitationService.updateInvitationStatus(decoded.invitationId, 'REJECTED');

    return res.json({ con: true, msg: "Invitation rejected successfully" });
  } catch (error) {
    return res.status(401).json({ con: false, msg: "Invalid or expired token" });
  }
  }
};
