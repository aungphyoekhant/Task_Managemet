import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterPayload } from "../types/global";
import { Role } from "../generated/prisma/client";

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
        console.log("++++++++++++++++++++++++++ normal register function is called ")
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

    console.log("********************** invite register function is called ")
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
};
