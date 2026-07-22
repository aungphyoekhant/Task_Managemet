import { prisma } from "../lib/prisma";

export const profileService = {
  getProfile: async (userId: number) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            name: true,
            avatar: true,
            jobTitle: true,
            bio: true,
            phone: true,
          }
        },
        workspaceUsers: {
          select: {
            role: true,
            workspaceId: true,
            workspace: { select: { name: true } }
          },
        },
      },
    });
  },

  getWorkspaceUser: async (userId: number, workspaceId: number) => {
    return await prisma.workspaceUser.findFirst({
      where: { userId, workspaceId },
    });
  },

  upsertProfile: async (userId: number, data: any) => {
    
    const profileData = {
      name: data.name,
      avatar: data.avatar,
      jobTitle: data.jobTitle,
      bio: data.bio,
      phone: data.phone,
    };

    return await prisma.profile.upsert({
      where: { userId: userId },
      update: profileData,
      create: {
        userId: userId, 
        ...profileData,
      },
    });
  },
};