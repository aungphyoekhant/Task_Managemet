import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AccessPayload, RefreshPayload, ComparePassword, UpdateTokenPayload, RefreshTokenPayload, WorkspaceUserRole, WorkspaceUser } from "../types/global";

import { WorkspaceUserParams } from "../types/global";

export const authService = {
  // FindByEmail
  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  getWorkspaceById: async (id: number) => {
    return await prisma.workspace.findUnique({
      where: { id },
    });
  },

  findWorkspaceUser: async (data : WorkspaceUser) => {
    return await prisma.workspaceUser.findFirst({
      where : {
        workspaceId : data.workspaceId,
        userId : data.userId
      }
    })
  },

  getWorkspaceUserRole: async (data: WorkspaceUserParams) => {
    const member = await prisma.workspaceUser.findFirst({
      where: {
        userId: data.userId,
        workspaceId: data.workspaceId,
      },
      select: { role: true, userId: true, workspaceId: true },
    });

    return member;
  },

  getWorkspaceUser: async (data: WorkspaceUserRole) => {
    const result = await prisma.workspaceUser.findFirst({
      where: {
        userId: data.userId,
        workspaceId: data.workspaceId,
      },

      select: { role: true, userId: true, workspaceId: true },
    });

    return result;
  },

  // ComparePassword
  comparePassword: async (data: ComparePassword) => {
    return await bcrypt.compare(data.password, data.hash);
  },

  // Generate Tokens
  generateTokens: (user: AccessPayload) => {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });

    // Refresh Token
    const refreshData: RefreshPayload = { id: user.id };
    const refreshToken = jwt.sign(refreshData, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

    return { accessToken, refreshToken };
  },

  // Update Refresh Token
  updateRefreshToken: async ({ userId, token }: UpdateTokenPayload) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  },

  // Verify Access Token
  verifyRefreshToken: (token: string): RefreshTokenPayload => {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as { id: number };

    return {
      id: decoded.id,
      token: token,
    };
  },
};
