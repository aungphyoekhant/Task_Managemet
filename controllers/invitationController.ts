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
      // Check if the token is valid
      const decoded = jwt.verify(token as string, process.env.INVITATION_SECRET as string) as any;
      const { invitationId, email } = decoded;

      // invitedBy is the user who sent the invitation
      const invitation = await invitationService.getInvitationById(invitationId);
      if (!invitation || invitation.status !== "PENDING") {
        return res.status(400).json({ con: false, msg: "Invitation invalid or already used" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        return res.json({
          con: true,
          action: "REGISTER",
          email,
          invitationId,
        });
      }

      // ၄။ အကောင့်ရှိရင် Member ဖြစ်ပြီးသားလား စစ်ဆေးခြင်း
      const existingMember = await prisma.workspaceUser.findFirst({
        where: { userId: existingUser.id, workspaceId: invitation.workspaceId },
      });

      if (existingMember) {
        return res.status(400).json({ con: false, msg: "You are already a member of this workspace" });
      }

      // ၅။ Member အဖြစ် ထည့်သွင်းခြင်း
      await invitationService.addMember(existingUser.id, invitation.workspaceId, invitation.role);

      // ၆။ Status အပ်ဒိတ်လုပ်ခြင်း
      await invitationService.updateInvitationStatus(invitationId, "ACCEPTED");

      return res.json({ con: true, msg: "Successfully joined the workspace!" });
    } catch (error) {
      console.error("Accept Invitation Error:", error);
      return res.status(401).json({ con: false, msg: "InvitatioController :Invalid or expired token" });
    }
  },
};
