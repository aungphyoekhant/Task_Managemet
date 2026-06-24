// services/profileService.ts
import { prisma } from "../lib/prisma";

export const profileService = {
  getProfile: async (userId: number) => {
    return await prisma.profile.findUnique({
      where: { userId: userId },
    });
  },

  upsertProfile: async (userId: number, data: { name: string; avatar: string }) => {
    return await prisma.profile.upsert({
      where: { userId: userId },
      update: { name: data.name, avatar: data.avatar },
      create: {
        userId: userId,
        name: data.name,
        avatar: data.avatar,
      },
    });
  },
};
