export const ActivityLog = async (
  tx: any,
  {
    workspaceId,
    userId,
    action,
    entityType,
    entityId,
  }: {
    workspaceId: number;
    userId: number;
    action: string;
    entityType: string;
    entityId: number;
  },
) => {
  return await tx.activityLog.create({
    data: {
      workspaceId,
      userId,
      action,
      entityType,
      entityId,
    },
  });
};
