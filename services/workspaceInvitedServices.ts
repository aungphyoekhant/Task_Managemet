import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { transporter } from "../lib/nodemailer";
import { Role } from "../generated/prisma/client";

export const workspaceInvitedService = {
  inviteUser: async (userId: number, workspaceId: number, email: string, role: string) => {
    // ၁။ Workspace ရှိမရှိ စစ်ဆေးခြင်း
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId, ownerId: userId },
      include: { profile: true },
    });

    if (!workspace) throw new Error("Workspace not found or unauthorized");
    if (role === "OWNER") throw new Error("You cannot invite another user as an OWNER");

    const receiver = await prisma.user.findUnique({ where: { email: email } });

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId: workspaceId,
        email: email,
        role: role as Role,
        invitedBy: userId,
        invitedTo: receiver ? receiver.id : null,
      },
    });

    const secret = process.env.INVITATION_SECRET;
    if (!secret) throw new Error("INVITATION_SECRET is not configured");

    const token = jwt.sign({ invitationId: invitation.id, email: email }, secret, { expiresIn: "48h" });
    const inviteLink = `http://localhost:3000/users/acceptInvitation?token=${token}`;

    const ownerName = workspace.profile[0]?.name || "Workspace Owner";

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4a90e2; padding: 20px; text-align: center; color: #ffffff;">
        <h1>Workspace Invitation</h1>
      </div>
      <div style="padding: 30px;">
        <p>You have been invited to join with role: <strong>${role}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4a90e2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        </div>
      </div>
    </div>`;

    await transporter.sendMail({
      from: `${ownerName} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You have been invited to a Workspace!",
      html: htmlContent,
    });

    return invitation;
  },
};
