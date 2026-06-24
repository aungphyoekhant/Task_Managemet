import { prisma } from "../lib/prisma";

export const userService = {
  logout: async (userId: number) => {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  },
};
