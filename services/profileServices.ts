import { prisma } from "../lib/prisma";

export const profileService = {
  getProfile: async (userId: number) => {
    return await prisma.profile.findUnique({
      where: { userId },
    });
  },

  upsertProfile: async (userId: number, data: { name: string; avatar: string }) => {
    return await prisma.profile.upsert({
      where: { userId },
      update: { name: data.name, avatar: data.avatar },
      create: { name: data.name, avatar: data.avatar, userId },
    });
  },
};
