import { prisma } from "../lib/prisma.js"
import jwt from "jsonwebtoken";
import { transporter } from "../lib/nodemailer.js";
import { Role } from "../../generated/prisma/client.js";

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

      // const frontendUrl = "https://taskmgr.denogameshop.com";
      // const inviteLink = `${frontendUrl}/accept?token=${token}`;

    
    //  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    //  const inviteLink = `http://localhost:5173/accept?token=${token}`;

    const ownerName = workspace.profile?.[0]?.name || "Workspace Owner";

    const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0F172A; padding: 40px 16px; margin: 0; width: 100%; box-sizing: border-box;">
  <!-- Container Card with Glow & Rounded Corners -->
  <div style="max-width: 500px; margin: 0 auto; background-color: #1E293B; border-radius: 24px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.25); box-shadow: 0 20px 50px rgba(79, 70, 229, 0.2);">
    
    <!-- Modern Indigo Gradient Header -->
    <div style="background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%); padding: 36px 28px; text-align: center;">
      <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 8px 16px; border-radius: 100px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
        <span style="color: #E0E7FF; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">Workspace Invite</span>
      </div>
      <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">You're Invited!</h1>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 28px; background-color: #1E293B;">
      <p style="color: #E2E8F0; font-size: 15px; margin: 0 0 16px 0; font-weight: 500;">Hello,</p>
      <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        <strong style="color: #F8FAFC;">${inviterName}</strong> has invited you to join the workspace <strong style="color: #818CF8;">${workspaceName}</strong>.
      </p>

      <!-- Role Card Container -->
      <div style="background-color: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 16px; padding: 18px 20px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between;">
        <span style="color: #94A3B8; font-size: 13px; font-weight: 500;">Assigned Role:</span>
        <span style="background-color: rgba(99, 102, 241, 0.2); color: #818CF8; border: 1px solid rgba(99, 102, 241, 0.4); padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          ${role}
        </span>
      </div>

      <!-- Action CTA Button -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${inviteLink}" style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);">
          Accept Invitation &rarr;
        </a>
      </div>

      <!-- Expiry Notice -->
      <div style="text-align: center;">
        <p style="color: #64748B; font-size: 12px; margin: 0;">
          ⏳ This invitation will expire in <strong style="color: #94A3B8;">48 hours</strong>.
        </p>
      </div>
    </div>

    <!-- Minimal Modern Footer -->
    <div style="padding: 20px 28px; background-color: #0F172A; text-align: center; border-top: 1px solid #334155;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 4px 0; font-weight: 500;">
        Sent to <span style="color: #94A3B8;">${email}</span>
      </p>
      <p style="color: #475569; font-size: 11px; margin: 0;">
        &copy; ${new Date().getFullYear()} TaskFlow. All rights reserved.
      </p>
    </div>

  </div>
</div>
    `;

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