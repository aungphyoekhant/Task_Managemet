import { prisma } from "../lib/prisma.js"

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

 removeWorkspaceUser: async (workspaceId: number, userId: number) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Workspace ထဲတွင် အဆိုပါ User ရှိမရှိ စစ်ဆေးခြင်း
      const workspaceUser = await tx.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            workspaceId: workspaceId,
            userId: userId,
          },
        },
      });

      if (!workspaceUser) {
        throw new Error("User not found in this workspace");
      }

      // 2. Workspace ထဲမှ Member ကို ဖယ်ရှားမည် (WorkspaceUser ဖျက်မည်)
      const deletedWorkspaceUser = await tx.workspaceUser.delete({
        where: {
          userId_workspaceId: {
            workspaceId: workspaceId,
            userId: userId,
          },
        },
      });

      // 3. ဤ Workspace ထဲတွင် အဆိုပါ User ပါဝင်နေသော ProjectUser များကိုပါ ရှင်းလင်းမည်
      await tx.projectUser.deleteMany({
        where: {
          workspaceId: workspaceId,
          userId: userId,
        },
      });

      // 4. ဤ Workspace ထဲတွင် အဆိုပါ User တာဝန်ယူထားသော TaskUser များကိုပါ အမှိုက်မကျန်အောင် ရှင်းလင်းမည်
      await tx.taskUser.deleteMany({
        where: {
          workspaceId: workspaceId,
          userId: userId,
        },
      });

      return deletedWorkspaceUser;
    });
  },
};
