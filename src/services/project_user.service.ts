import { prisma } from "../lib/prisma.js";
import { auditService } from "./audit.service.js";
import { Role } from "../../generated/prisma/enums.js";

export const projectUserService = {
  addMember: async (workspaceId: number,projectId: number, userId: number, addedById: number, role? : Role ) => {
    const userInWorkspace = await prisma.workspaceUser.findFirst({
      where: { userId, workspaceId },
    });

    if (!userInWorkspace) {
      throw new Error("User is not part of this workspace");
    }

    // if (userInWorkspace.role !== "MEMBER") {
    //   throw new Error("Only members can be added to a project. Admins/Owners cannot be added as Project Users.");
    // }

    const isAlreadyMember = await prisma.projectUser.findFirst({
      where: { projectId, userId },
    });

    if (isAlreadyMember) {
      throw new Error("User is already a member of this project");
    }

    return await prisma.projectUser.create({
      data: {
        workspaceId,
        projectId,
        userId: userId,
        addedById: addedById,
        role : role || "MEMBER"
      },
    });
  },

  getMembersByProject : async (projectId: number, userId: number) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true }
    });

    if (!project) throw new Error("Project not found");

    const memberRole = await prisma.workspaceUser.findFirst({
      where: { userId, workspaceId: project.workspaceId },
    });

    if (!memberRole) {
      throw new Error("Access denied: You are not part of this workspace");
    }

    return await prisma.projectUser.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true, avatar: true } },
          },
        },
      },
    });
  },

 removeMember: async (projectUserId: number, actorUserId: number) => {
    return await prisma.$transaction(async (tx) => {
      const member = await tx.projectUser.findUnique({
        where: { id: projectUserId },
        include: { project: { select: { workspaceId: true } } }
      });

      if (!member) throw new Error("Member not found");

      
      const actorRole = await tx.workspaceUser.findFirst({
        where: { userId: actorUserId, workspaceId: member.project.workspaceId }
      });

      if (!actorRole || (actorRole.role !== "ADMIN" && actorRole.role !== "OWNER")) {
        throw new Error("Access denied: Only Admins/Owners can remove members");
      }

      await tx.projectUser.delete({ where: { id: projectUserId } });

      await auditService.ActivityLog({
        workspaceId: member.project.workspaceId,
        userId: actorUserId,
        action: "REMOVE_MEMBER",
        entityType: "PROJECT_USER",
        entityId: projectUserId,
      });

      return { success: true };
    });
  },

  getProjectMemberById: async (projectUserId: number) => {
    return await prisma.projectUser.findUnique({
      where: { id: projectUserId },
      include: { project: true },
    })
  },

  getProjectUserByUserId: async (projectId: number, userId: number) => {
    return await prisma.projectUser.findFirst({
      where: { projectId: projectId, userId: userId },
    })
  }

};
