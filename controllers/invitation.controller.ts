import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { invitationService } from "../services/invitation.service";
import { InvitationStatus } from "../generated/prisma/client";
import { InvitationTokenPayload } from "../types/global";

export const invitationController = {
  acceptInvitation: async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ con: false, msg: "Token is required" });

    try {
      const decoded = jwt.verify(token as string, process.env.INVITATION_SECRET as string) as InvitationTokenPayload;

      const { invitationId, email } = decoded;

      // ၂။ Invitation ရှိမရှိ စစ်ဆေးခြင်း
      const invitation = await invitationService.getInvitationById(invitationId);
      if (!invitation || invitation.status !== InvitationStatus.PENDING) {
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

      // ၄။ Member ဖြစ်ပြီးသားလား စစ်ဆေးခြင်း
      const existingMember = await prisma.workspaceUser.findFirst({
        where: { userId: existingUser.id, workspaceId: invitation.workspaceId },
      });
      if (existingMember) return res.status(400).json({ con: false, msg: "Already a member" });

      // ၅။ Transaction ဖြင့် Member ထည့်ခြင်းနှင့် Status ပြောင်းခြင်း
      await invitationService.processAcceptInvitation(
        {
          userId: existingUser.id,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
        {
          id: invitation.id,
          status: InvitationStatus.ACCEPTED,
        },
      );

      return res.json({ con: true, msg: "Successfully joined!" });
    } catch (error) {
      return res.status(401).json({ con: false, msg: "Invalid or expired token" });
    }
  },
};
