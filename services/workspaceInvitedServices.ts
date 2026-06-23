import { prisma } from "../lib/prisma";
import { transporter } from "../lib/nodemailer";
import { Role } from "../generated/prisma/client";
import { logger } from "../lib/logger";

export const workspaceInvitedService = {
  inviteUser: async (userId: number, workspaceId: number, email: string, role: string) => {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
      include: { profile: true },
    });

    if (!workspace) {
      throw new Error("Workspace not found or unauthorized");
    }

    if (role === "OWNER") {
      throw new Error("You cannot invite another user as an OWNER");
    }

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId: workspaceId,
        email: email,
        role: role as Role,
        invitedBy: userId,
      },
    });

    console.log("Sending email to:", email);

    const ownerName = workspace.profile[0]?.name;
    const ownerAvatar = workspace.profile[0]?.avatar;

    const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #f9f9f9;">
    <div style="background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 2px solid #f0f0f0;">
      <h2 style="color: #333; margin: 0;">Workspace Invitation</h2>
    </div>

    <div style="padding: 30px; background-color: #ffffff;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        ${ownerAvatar ? `<img src="${ownerAvatar}" alt="Owner" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px; border: 1px solid #ddd;" />` : ""}
        <p style="font-size: 16px; color: #444; margin: 0;">
          <strong>Workspace Admin</strong> has invited you to join the team.
        </p>
      </div>

      <p style="color: #666; line-height: 1.6; font-size: 15px;">
        You have been invited to join the <strong>${workspace.name}</strong> workspace as an <strong>${role}</strong>.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/accept?id=${invitation.id}" 
           style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
           Accept Invitation
        </a>
      </div>

      <p style="font-size: 13px; color: #999; margin-top: 20px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  </div>
`;

    try {
      const info = await transporter.sendMail({
        from: `${ownerName} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "You have been invited to a Workspace!",
        html: htmlContent,
      });
      console.log("Email successfully sent! Message ID:", info.messageId);
    } catch (error) {
      console.error("FAILED TO SEND EMAIL. Error details:", error);
    }

    return invitation;
  },

  acceptInvitation: async (invitationId: number, userId: number) => {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    await prisma.workspaceUser.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: userId,
        role: invitation.role,
      },
    });

    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: "ACCEPTED",
      },
    });

    return {
      msg: "Accepted invitation successfully",
      workspaceId: invitation.workspaceId,
    };
  },
};
