import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userService = {
  findUserByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  comparePassword: async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
  },

  generateTokens: (user: { id: number; email: string; role: string }) => {
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });
    return { accessToken, refreshToken };
  },

  updateRefreshToken: async (userId: number, token: string) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  },

  verifyRefreshToken: (token: string) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as { id: number };
  },

  logout: async (userId: number) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }, // Refresh Token ကို ဖြတ်ထုတ်လိုက်ပါ
    });
  },
};
