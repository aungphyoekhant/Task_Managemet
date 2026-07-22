import { prisma } from "../lib/prisma"
import jwt from "jsonwebtoken";
import { transporter } from "../lib/nodemailer";
import { Role } from "../../generated/prisma/client";

export const workspaceInvitationService = {
  inviteUser: async (userId: number, workspaceId: number, email: string, role: string) => {
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        workspaceId,
        email: email.toLowerCase(),
        status: "PENDING"
      }
    });

    if (existingInvite) {
      throw new Error("This email already has a pending invitation for this workspace.");
    }

    const existingMember = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        user: { email: email.toLowerCase() }
      }
    });

    if (existingMember) {
      throw new Error("This user is already a member of this workspace.");
    }

    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!inviter) throw new Error("Inviter not found");

    if (inviter.email.toLowerCase() === email.toLowerCase()) {
      throw new Error("You cannot invite yourself to the workspace.");
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { profile: true },
    });

    if (!workspace) throw new Error("Workspace not found");

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId,
        email: email.toLowerCase(),
        role: role.toUpperCase() as Role,
        invitedBy: userId,
        invitedTo: null,
      },
    });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const isUserExist = !!user; 

    const secret = process.env.INVITATION_SECRET;
    if (!secret) throw new Error("INVITATION_SECRET is not configured");

    const inviterName = inviter.profile?.name || "Someone";
    const workspaceName = workspace.name || "Workspace"; 
    
    const token = jwt.sign(
      { 
        invitationId: invitation.id, 
        email: email.toLowerCase(), 
        isUserExist: isUserExist,
        workspaceId: workspaceId,
        workspaceName: workspaceName,
        role : role,
        invitedBy: inviterName,
        invitedAt: new Date().toISOString()
      }, 
      secret, 
      { expiresIn: "48h" }
    );
    
    const inviteLink = `http://localhost:5173/accept?token=${token}`;    
    const ownerName = workspace.profile?.[0]?.name || "Workspace Owner";

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4a90e2; padding: 20px; text-align: center; color: #ffffff;">
        <h1>Workspace Invitation</h1>
      </div>
      <div style="padding: 30px;">
        <p>Hello,</p>
        <p>You have been invited to join <strong>${workspaceName}</strong> by <strong>${inviterName}</strong>.</p>
        <p>Role assigned: <strong>${role}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4a90e2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        </div>
        <div>${email}</div>
        <p style="color: #888; font-size: 12px;">This invitation will expire in 48 hours.</p>
      </div>
    </div>`;

    try {
      await transporter.sendMail({
        from: `${ownerName} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `You have been invited to ${workspaceName}!`,
        html: htmlContent,
      });
    } catch (error) {
      console.error("Email Sending Failed:", error);
    }

    return { invitation, token, inviteLink };
  },
};