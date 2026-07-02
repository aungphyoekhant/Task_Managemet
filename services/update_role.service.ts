import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

export const updateRoleServices = {
  updateRole: async (workspaceId: number, userId: number, newRole: string) => {
    return await prisma.workspaceUser.updateMany({
      where: { workspaceId, userId },
      data: { role: newRole.toUpperCase() as Role },
    });
  },
};
