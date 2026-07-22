import { prisma } from "../lib/prisma";

export const auditService = {
  /**
   * Activity log အသစ်တစ်ခု ဖန်တီးရန်
   */
  ActivityLog: async (data: { workspaceId: number; userId: number; action: string; entityType: string; entityId: number }) => {
    try {
      return await prisma.activityLog.create({
        data: {
          workspaceId: data.workspaceId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
        },
      });
    } catch (error) {
      console.error("Failed to save activity log:", error);
    }
  },
};
