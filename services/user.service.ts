import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterPayload } from "../types/global";
import { Role } from "../generated/prisma/client";

const handleInvitation = async (tx: any, userId: number, invitationId: number) => {
  const invitation = await tx.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) throw new Error("Invitation not found");

  if (invitation.status === "ACCEPTED") {
    const isAlreadyMember = await tx.workspaceUser.findFirst({
      where: { userId: userId, workspaceId: invitation.workspaceId },
    });

    if (isAlreadyMember) return;

    throw new Error("Invitation invalid or already used");
  }

  if (invitation.status === "PENDING") {
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
  }
};

export const userServices = {
  register: async (userData: RegisterPayload, token?: string) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    let invitationId: number | undefined;

    if (token) {
      try {
        const secret = process.env.INVITATION_SECRET as string;
        const decoded: any = jwt.verify(token, secret);
        invitationId = decoded.invitationId;
      } catch (error) {
        throw new Error("Invalid or expired invitation token");
      }
    }

    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isVerified: !!invitationId,
          profile: { create: { name: userData.name } },
        },
      });

      if (invitationId) {
        await handleInvitation(tx, newUser.id, invitationId);
      } else {
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
      }

      return {
        id: newUser.id,
        email: newUser.email,
        name: userData.name,
        isVerified: newUser.isVerified,
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

    let invitationId: number | undefined;

    if (token) {
      try {
        const secret = process.env.INVITATION_SECRET as string;
        const decoded: any = jwt.verify(token, secret);
        invitationId = decoded.invitationId;
      } catch (error) {
        throw new Error("Invalid or expired invitation token");
      }
    }

    if (invitationId) {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
      });

      if (!invitation) throw new Error("Invitation not found");

      const isAlreadyMember = await prisma.workspaceUser.findFirst({
        where: {
          userId: user.id,
          workspaceId: invitation.workspaceId,
        },
      });

      if (!isAlreadyMember) {
        await prisma.$transaction(async (tx) => {
          await handleInvitation(tx, user.id, invitationId!);
        });
      }
    }

    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId: user.id },
      orderBy: { id: "desc" },
    });

    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });

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
};
