import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type UserPayload = { id: number; email: string; role: string };

export const authService = {
  // findByEmail
  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  // comparePassword
  comparePassword: async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
  },

  // generateTokens
  generateTokens: (user: UserPayload) => {
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });
    return { accessToken, refreshToken };
  },

  // updateRefreshToken
  updateRefreshToken: async (userId: number, token: string | null) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  },

  // verifyRefreshToken
  verifyRefreshToken: (token: string) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as { id: number };
  },
};
