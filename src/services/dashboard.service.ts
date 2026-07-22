import { prisma } from "../lib/prisma";
import { TaskStatus } from "../../generated/prisma/client";

import { WorkspaceUserRole } from "../types/global";
export const dashboardService = {
  getDashboardStats: async ({ userId, workspaceId, role }: WorkspaceUserRole) => {
    const isMember = role === "MEMBER";
    const whereClause = { workspaceId };

    const taskFilter = isMember ? { ...whereClause, assignedTo: userId } : whereClause;

    const [totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({ where: { ...taskFilter, status: TaskStatus.DONE } }),
      prisma.task.count({
        where: { ...taskFilter, status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } },
      }),
      prisma.task.count({
        where: { ...taskFilter, status: { not: TaskStatus.DONE }, dueDate: { lt: new Date() } },
      }),
    ]);

    let extraStats = {};
    if (!isMember) {
      const [totalProjects, totalMembers] = await Promise.all([
        prisma.project.count({ where: whereClause }),
        prisma.workspaceUser.count({ where: whereClause }),
      ]);
      extraStats = { totalProjects, totalMembers };
    }

    return {
      role,
      stats: { totalTasks, completedTasks, pendingTasks, overdueTasks, ...extraStats },
    };
  },
};
