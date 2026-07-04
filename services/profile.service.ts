import { prisma } from "../lib/prisma";

export const profileService = {
  getProfile: async (userId: number) => {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        profile: true,

        workspaceUsers: {
          select: {
            role: true,
            workspaceId: true,
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
    const dataToUpsert = {
      name: data.name,
      avatar: data.avatar,
      jobTitle: data.jobTitle,
      bio: data.bio,
      phone: data.phone,
      ...(data.workspaceId && { workspaceId: data.workspaceId }),
    };

    return await prisma.profile.upsert({
      where: { userId: userId },
      update: dataToUpsert,
      create: {
        userId: userId,
        ...dataToUpsert,
      },
    });
  },
};
