import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AccessPayload, RefreshPayload, RegisterPayload } from "../types/global";

// Transaction
const handleInvitation = async (tx: any, userId: number, invitationId: number) => {
  const invitation = await tx.invitation.findUnique({
    where: { id: invitationId },
  });

  if (invitation && invitation.status === "PENDING") {
    const existingMember = await tx.workspaceUser.findFirst({
      where: { userId, workspaceId: invitation.workspaceId },
    });

    if (!existingMember) {
      await tx.workspaceUser.create({
        data: {
          userId,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      });
    }

    await tx.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED", invitedTo: userId },
    });
  }
};

export const userServices = {
  // Register
  register: async (userData: RegisterPayload, invitationId?: number) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          role: "MEMBER",
          profile: { create: { name: userData.name } },
        },
        select: {
          id: true,
          email: true,
          role: true,
          profile: { select: { name: true } },
        },
      });

      if (invitationId) await handleInvitation(tx, newUser.id, invitationId);

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.profile?.name,
        role: newUser.role,
      };
    });
  },

  login: async (email: string, password: string, invitationId?: number) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Account not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid password");

    if (invitationId) {
      await prisma.$transaction(async (tx) => {
        await handleInvitation(tx, user.id, invitationId);
      });
    }

    // Role အသစ်ကို ရှာဖွေခြင်း
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId: user.id },
    });

    const resolvedRole = workspaceUser ? workspaceUser.role : user.role;

    // Token ထဲမှာ role အသစ်ကို ထည့်ခြင်း
    const payload: AccessPayload = { id: user.id, email: user.email, role: resolvedRole };
    const refreshPayload: RefreshPayload = { id: user.id };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });
    const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // အရေးကြီးဆုံးပြင်ဆင်ချက်: return ထဲမှာ user.role အစား resolvedRole ကို သုံးပေးပါ
    return {
      user: {
        id: user.id,
        email: user.email,
        role: resolvedRole,
      },
      accessToken,
      refreshToken,
    };
  },

  // Logout
  logout: async (userId: number) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    return await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },
};
