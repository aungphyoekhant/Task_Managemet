import { prisma } from "../lib/prisma"

export const workspaceUserService = {
  getWorkspaceUsers: async (workspaceId: number) => {
    return await prisma.workspaceUser.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                avatar: true,
                jobTitle: true,
              },
            },
          },
        },
      },
    });
  },
};
