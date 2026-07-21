import { prisma } from "../lib/prisma";
import { TaskStatus } from "../generated/prisma/enums";

export const searchService = {

   async verifyWorkspaceAccess(workspaceId: number, userId: number) {
    const isMember = await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
    });
    if (!isMember) throw new Error("UNAUTHORIZED_ACCESS");
  },


  searchProjects: async (workspaceId: number, q: string) => {
    return await prisma.project.findMany({
      where: {
        workspaceId,
        name: { contains: q, mode: "insensitive" },
      },
    });
  },

  searchTasksByTitle: async (workspaceId: number, projectId: number, userId: number, title: string) => {
    await searchService.verifyWorkspaceAccess(workspaceId, userId);
    return await prisma.task.findMany({
      where: { workspaceId, projectId, title: { contains: title, mode: "insensitive" } },
    });
  },

  searchTasksByStatus: async (workspaceId: number, projectId: number, userId: number, status: TaskStatus) => {
    await searchService.verifyWorkspaceAccess(workspaceId, userId);
    return await prisma.task.findMany({
      where: { workspaceId, projectId, status },
    });
  },
  

 searchUsers: async (workspaceId: number, q: string) => {
    return await prisma.workspaceUser.findMany({
      where: {
        workspaceId: Number(workspaceId),
        user: {
          OR: [
            { profile: { name: { contains: q, mode: "insensitive" } } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      },
      include: { user: { include: { profile: true } } },
    });
  },

  searchWorkspaces: async (userId: number, q: string) => {
    return await prisma.workspace.findMany({
      where: {
        AND: [
          {
            OR: [
              { ownerId: userId },
              { workspaceUsers: { some: { userId: userId } } }
            ]
          },
          {
            name: { contains: q, mode: "insensitive" }
          }
        ]
      },
    });
  },

};