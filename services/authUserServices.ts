import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const handleInvitation = async (userId: number, invitationId: number) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (invitation && invitation.status === "PENDING") {
    await prisma.workspaceUser.create({
      data: {
        userId: userId,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
    });

    // ၂။ Invitation ကို Accept လုပ်ပြီးသားဖြစ်ကြောင်း အပ်ဒိတ်လုပ်ခြင်း
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED", invitedTo: userId },
    });
  }
};

export const authUserServices = {
  // Register
  register: async (userData: any, invitationId?: number) => {
    const { email, password, name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "MEMBER",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // အကယ်၍ invitationId ပါလာလျှင် အလိုလို Join ပေးပါ
    if (invitationId) {
      await handleInvitation(newUser.id, invitationId);
    }

    return newUser;
  },

  // Login
  login: async (email: string, password: string, invitationId?: number) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Not Found Account");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Password မှားယွင်းနေသည်။");

    // အကယ်၍ invitationId ပါလာလျှင် Login ဝင်ပြီးသည်နှင့် Join ပေးပါ
    if (invitationId) {
      await handleInvitation(user.id, invitationId);
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    };
  },

  logout: async (userId: number) => {
    return await prisma.user.delete({
      where: { id: userId },
    });
  },
};
