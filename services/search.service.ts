import { prisma } from "../lib/prisma";

import { TaskStatus } from "../generated/prisma/client";
interface SearchBaseParams {
  workspaceId: number;
  q: string;
  userId: number;
  role: string;
}

export const searchService = {
  searchProjects: async ({ workspaceId, q, userId, role }: SearchBaseParams & { status?: string }) => {
    return await prisma.project.findMany({
      where: {
        workspaceId,
        name: { contains: q, mode: "insensitive" },
      },
    });
  },

  searchTasks: async ({ workspaceId, q, status, userId, role }: any) => {
    return await prisma.task.findMany({
      where: {
        workspaceId,
        title: { contains: q, mode: "insensitive" },
        ...(status && { status: TaskStatus }),
      },
    });
  },
  searchUsers: async ({ workspaceId, q }: { workspaceId: number; q: string }) => {
    return await prisma.workspaceUser.findMany({
      where: {
        workspaceId,
        user: {
          OR: [{ profile: { name: { contains: q, mode: "insensitive" } } }, { email: { contains: q, mode: "insensitive" } }],
        },
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
  },

  searchWorkspaces: async ({ userId, q }: { userId: number; q: string }) => {
    return await prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { workspaceUsers: { some: { userId } } }],
        name: { contains: q, mode: "insensitive" },
      },
    });
  },

  globalSearch: async ({ workspaceId, q, userId, role }: SearchBaseParams) => {
    const [projects, tasks, users] = await Promise.all([
      // Project ရှာခြင်း
      prisma.project.findMany({
        where: { workspaceId, name: { contains: q, mode: "insensitive" } },
      }),

      // Task ရှာခြင်း
      prisma.task.findMany({
        where: { workspaceId, title: { contains: q, mode: "insensitive" } },
      }),

      // User ရှာခြင်း (Profile ထဲမှ name ကို ရှာခြင်း)
      prisma.workspaceUser.findMany({
        where: {
          workspaceId,
          user: {
            profile: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        },
        include: {
          user: {
            include: { profile: true },
          },
        },
      }),
    ]);

    return { projects, tasks, users };
  },
};
