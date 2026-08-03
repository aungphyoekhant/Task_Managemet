import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const authService = {
    // FindByEmail
    findByEmail: async (email) => {
        return await prisma.user.findUnique({ where: { email } });
    },
    getWorkspaceById: async (id) => {
        return await prisma.workspace.findUnique({
            where: { id },
        });
    },
    findWorkspaceUser: async (data) => {
        return await prisma.workspaceUser.findFirst({
            where: {
                workspaceId: data.workspaceId,
                userId: data.userId
            }
        });
    },
    getWorkspaceUserRole: async (data) => {
        const member = await prisma.workspaceUser.findFirst({
            where: {
                userId: data.userId,
                workspaceId: data.workspaceId,
            },
            select: { role: true, userId: true, workspaceId: true },
        });
        return member;
    },
    getWorkspaceUser: async (data) => {
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
    comparePassword: async (data) => {
        return await bcrypt.compare(data.password, data.hash);
    },
    // Generate Tokens
    generateTokens: (user) => {
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        // Refresh Token
        const refreshData = { id: user.id };
        const refreshToken = jwt.sign(refreshData, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        return { accessToken, refreshToken };
    },
    // Update Refresh Token
    updateRefreshToken: async ({ userId, token }) => {
        return await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: token },
        });
    },
    // Verify Access Token
    verifyRefreshToken: (token) => {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return {
            id: decoded.id,
            token: token,
        };
    },
};
