// services/profileService.ts
import { prisma } from "../lib/prisma";
import { UpsertProfileData } from "../types/global";

export const profileService = {
  getProfile: async (userId: number) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        status: true,
        createdAt: true,
        profile: {
          include: {
            workspace: true,
          },
        },
        workspaceUsers: {
          include: {
            workspace: {
              include: {
                projects: true,
                tasks: true,
                invitations: true,
                notifications: true,
                activityLogs: true,
              },
            },
          },
        },
        projects: {
          include: {
            workspace: true,
            projectUsers: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    profile: true,
                  },
                },
              },
            },
            tasks: true,
          },
        },
        projectUsers: {
          include: {
            project: {
              include: {
                workspace: true,
                tasks: true,
              },
            },
            tasks: true,
          },
        },
        notifications: true,
        userNotis: {
          include: {
            notification: true,
          },
        },
        activityLogs: true,
        invitations: {
          include: {
            workspace: true,
            receiver: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                profile: true,
              },
            },
          },
        },
        invitedTo: {
          include: {
            workspace: true,
            sender: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                profile: true,
              },
            },
          },
        },
      },
    });
  },

  upsertProfile: async (userId: number, data: UpsertProfileData) => {
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId,
        ...(data.workspaceId ? { workspaceId: data.workspaceId } : {}),
      },
      orderBy: {
        id: "asc",
      },
    });

    if (!workspaceUser) {
      throw new Error(data.workspaceId ? "User is not a member of this workspace" : "User has no workspace");
    }

    return await prisma.profile.upsert({
      where: { userId: userId },
      update: {
        name: data.name,
        avatar: data.avatar,
        jobTitle: data.jobTitle,
        bio: data.bio,
        phone: data.phone,
        workspaceId: workspaceUser.workspaceId,
      },
      create: {
        userId: userId,
        name: data.name,
        avatar: data.avatar,
        jobTitle: data.jobTitle,
        bio: data.bio,
        phone: data.phone,
        workspaceId: workspaceUser.workspaceId,
      },
    });
  },
};
