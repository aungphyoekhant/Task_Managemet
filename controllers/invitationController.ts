import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { invitationService } from "../services/invitationServices";

export const invitationController = {
  acceptInvitation: async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ con: false, msg: "Token is required" });
    }

    try {
      // verify token
      const decoded = jwt.verify(token as string, process.env.INVITATION_SECRET as string) as any;
      const { invitationId, email } = decoded;

      // check if invitation is valid
      const invitation = await invitationService.getInvitationById(invitationId);
      if (!invitation || invitation.status !== "PENDING") {
        return res.status(400).json({ con: false, msg: "Invitation invalid or already used" });
      }

      // check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });

      // account not found
      if (!existingUser) {
        return res.json({ con: true, action: "REGISTER", email, invitationId });
      }

      // if have already joined the workspace
      await invitationService.addMember(existingUser.id, invitation.workspaceId, invitation.role);

      // approve invitation
      await invitationService.updateInvitationStatus(invitationId, "ACCEPTED");

      return res.json({ con: true, msg: "Successfully joined the workspace!" });
    } catch (error) {
      console.error("Accept Invitation Error:", error);
      return res.status(401).json({ con: false, msg: "Invalid or expired token" });
    }
  },
};
