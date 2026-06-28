import { prisma } from "../lib/prisma"; // အကယ်၍ သို့မဟုတ်ပါတယ်

export const projectUserService = {
  addMember: async (projectId: number, userId: number) => {
    const isAlreadyMember = await prisma.projectUser.findFirst({
      where: { projectId, userId },
    });

    if (isAlreadyMember) {
      throw new Error("User is already a member of this project");
    }

    return await prisma.projectUser.create({
      data: { projectId, userId },
    });
  },

  getMembersByProject: async (projectId: number) => {
    return await prisma.projectUser.findMany({
      where: { projectId },
      include: { user: true },
    });
  },

  removeMember: async (projectUserId: number) => {
    return await prisma.projectUser.delete({
      where: { id: projectUserId },
    });
  },
};
