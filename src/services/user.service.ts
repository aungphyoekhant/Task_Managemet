import { prisma } from "../lib/prisma.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterPayload } from "../types/global.js";
import { transporter } from "../lib/nodemailer.js";
import { Role } from "../../generated/prisma/client.js";


const handleInvitation = async (tx: any, userId: number, token: string) => {
  const secret = process.env.INVITATION_SECRET as string;
  const decoded: any = jwt.verify(token, secret);
  const invitationId = decoded.invitationId;

  const invitation = await tx.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) throw new Error("Invitation not found");

  if (invitation.status !== "PENDING") {
    throw new Error("This invitation is no longer valid.");
  }

  await tx.workspaceUser.create({
    data: {
      userId: userId,
      workspaceId: invitation.workspaceId,
      role: invitation.role.toUpperCase() as Role,
    },
  });

  await tx.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });

  return invitation.workspaceId;
};

export const userServices = {
  register: async (userData: RegisterPayload) => {
    
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("This email is already registered.");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isVerified: true, 
          profile: { create: { name: userData.name } },
        },
      });

      const newWorkspace = await tx.workspace.create({
        data: {
          name: `${userData.name}'s Workspace`,
          ownerId: newUser.id,
        },
      });

      await tx.workspaceUser.create({
        data: {
          userId: newUser.id,
          workspaceId: newWorkspace.id,
          role: "OWNER",
        },
      });

      return {
        id: newUser.id,
        email: newUser.email,
        name: userData.name,
        workspaceId: newWorkspace.id,
      };
    });
  },

  inviteRegister: async (userData: RegisterPayload, token: string) => {

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("This email is already registered.");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isVerified: true,
          profile: { create: { name: userData.name } },
        },
      });
     
      const workspaceId = await handleInvitation(tx, newUser.id, token);

      return {
        id: newUser.id,
        email: newUser.email,
        name: userData.name,
        workspaceId: workspaceId,
      };
    });
  },


  login: async (email: string, password: string, token?: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });


    if (!user) throw new Error("Account not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid password");

    let joinedWorkspaceId: number | null = null; 

    if (token) {
      try {
        const secret = process.env.INVITATION_SECRET as string;
        const decoded: any = jwt.verify(token, secret);
        const invitationId = decoded.invitationId;

        const invitation = await prisma.invitation.findUnique({
          where: { id: invitationId },
        });

        if (invitation && invitation.status === "PENDING") {
          const isAlreadyMember = await prisma.workspaceUser.findFirst({
            where: {
              userId: user.id,
              workspaceId: invitation.workspaceId,
            },
          });

          if (!isAlreadyMember) {
            await prisma.$transaction(async (tx) => {
              joinedWorkspaceId = await handleInvitation(tx, user.id, invitationId);
            });
          } else {
            joinedWorkspaceId = invitation.workspaceId;
          }
        }
      } catch (error) {
        
        console.error("Invitation token invalid during login:", error);
      }
    }

   
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { 
        userId: user.id,
        workspaceId: joinedWorkspaceId || undefined 
      },
      orderBy: { id: "desc" },
    });

    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        worksapceOwnerRole: {
          workspaceId: workspaceUser?.workspaceId,
          role: workspaceUser?.role,
          userId: user.id,
        },
      },
      accessToken,
      refreshToken,
    };
  },

  // LOGOUT
  logout: async (userId: number) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },

  forgetPassword: async (email: string) => {
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
    },
  });

  if (!user) {
  return { 
    success: false, 
    message: "Email address not found. Please check and try again." 
  };
}

  const displayName = user.profile?.name || "User";

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenExpiry = new Date(Date.now() + 3 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: resetCode, 
      passwordResetExpires: tokenExpiry,
    },
  });

  const mailOptions = {
    from: `"Task Flow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Verification Code",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0F172A; padding: 40px 16px; margin: 0; width: 100%; box-sizing: border-box;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #1E293B; border-radius: 24px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.25); box-shadow: 0 20px 50px rgba(79, 70, 229, 0.2);">
          
          <!-- Modern Indigo Gradient Header -->
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%); padding: 36px 28px; text-align: center;">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 8px 16px; border-radius: 100px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
              <span style="color: #E0E7FF; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">TaskFlow Auth</span>
            </div>
            <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Password Reset</h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 28px; background-color: #1E293B;">
            <p style="color: #E2E8F0; font-size: 15px; margin: 0 0 12px 0; font-weight: 500;">
              Hi ${displayName},
            </p>
            <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 28px 0;">
              We received a request to verify your account. Use the code below to reset your password. This code will automatically expire in <strong style="color: #E2E8F0;">10 minutes</strong>.
            </p>

            <!-- Glassmorphism Style OTP Container -->
            <div style="background: linear-gradient(180deg, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%); border: 1.5px dashed #6366F1; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px;">
              <span style="display: block; color: #818CF8; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Verification Code</span>
              <div style="font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; font-size: 36px; font-weight: 800; color: #6366F1; letter-spacing: 10px; padding-left: 10px;">
                ${resetCode}
              </div>
            </div>

            <!-- Security Info Banner -->
            <div style="background-color: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 14px 16px;">
              <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0;">
                🔒 <strong style="color: #94A3B8;">Didn't request this?</strong> You can safely ignore this email or reach out to support if you have concerns.
              </p>
            </div>
          </div>

          <!-- Minimal Modern Footer -->
          <div style="padding: 20px 28px; background-color: #0F172A; text-align: center; border-top: 1px solid #334155;">
            <p style="color: #64748B; font-size: 12px; margin: 0 0 4px 0; font-weight: 500;">
              TaskFlow Inc. &bull; Secure Authentication
            </p>
            <p style="color: #475569; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Sending Failed:", error);
    throw new Error("Failed to send verification email. Please try again.");
  }

  return { message: "Verification code sent to your email." };
  },

  
  verifyResetCode: async (email: string, code: string) => {
    const cleanEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user || user.passwordResetToken !== code || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new Error("Invalid or expired verification code.");
    }

    return { message: "Code verified successfully." };
  },

  resetPasswordWithCode: async (email: string, code: string, newPassword: string) => {
    
    const cleanEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user || user.passwordResetToken !== code || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new Error("Invalid or expired verification code.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: "Password successfully reset. You can now login." };
  },

  deleteAccount: async (userId: number) => {
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    await prisma.$transaction([
      prisma.invitation.deleteMany({
        where: { email: user.email },
      }),

      
      prisma.invitation.deleteMany({
        where: { invitedBy: userId },
      }),

      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return { message: "Account deleted successfully." };
  },

  changePassword: async ({ userId, currentPassword, newPassword, confirmNewPassword }: any) => {

    if (newPassword !== confirmNewPassword) {
      throw new Error("New password and confirm password do not match");
    }

    if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.notification.create({
  data: {
    message: `Your password has been changed successfully`,
    isRead: false,
    user: {
      connect: { id: userId },
    },
    
  },
});

    return { success: true };
  },

};
