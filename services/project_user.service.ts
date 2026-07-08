import { prisma } from "../lib/prisma"; // အကယ်၍ သို့မဟုတ်ပါတယ်

export const projectUserService = {
  addMember: async (projectId: number, userId: number, addedById: number, workspaceId: number) => {
    const userInWorkspace = await prisma.workspaceUser.findFirst({
      where: { userId, workspaceId },
    });

    if (!userInWorkspace) {
      throw new Error("User is not part of this workspace");
    }

    if (userInWorkspace.role !== "MEMBER") {
      throw new Error("Only members can be added to a project. Admins/Owners cannot be added as Project Users.");
    }

    const isAlreadyMember = await prisma.projectUser.findFirst({
      where: { projectId, userId },
    });

    if (isAlreadyMember) {
      throw new Error("User is already a member of this project");
    }

    return await prisma.projectUser.create({
      data: {
        projectId,
        userId: userId,
        addedById: addedById,
        workspaceId,
        role: "MEMBER",
      },
    });
  },

  getMembersByProject: async (projectId: number) => {
    return await prisma.projectUser.findMany({
      where: { projectId },
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

  removeMember: async (projectUserId: number) => {
    return await prisma.projectUser.delete({
      where: { id: projectUserId },
    });
  },

  getProjectMemberById : async (projectUserId: number) => {
    return await prisma.projectUser.findUnique({
      where: { id: projectUserId },
      include: { project: true },
  })
  },

  getProjectUserByUserId : async (projectId: number, userId: number) => {
    return await prisma.projectUser.findFirst({
      where: { projectId: projectId, userId: userId },
  })
  }

};
