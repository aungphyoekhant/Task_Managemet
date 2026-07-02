import { prisma } from "../lib/prisma";
import { TaskStatus } from "../generated/prisma/client";

export const dashboardService = {
  checkWorkspaceAccess: async (userId: number, role: string, workspaceId?: number) => {
    if (role === "OWNER") return true; // Owner အတွက် စစ်စရာမလို
    if (!workspaceId) throw new Error("WORKSPACE_ID_REQUIRED");

    const isMember = await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
    });
    if (!isMember) throw new Error("ACCESS_DENIED");
    return true;
  },

  getDashboardStats: async (userId: number, role: string, workspaceId?: number) => {
    // ၁။ Access Check
    await dashboardService.checkWorkspaceAccess(userId, role, workspaceId);

    // ၂။ Filter Logic
    const isOwner = role === "OWNER";
    const isMember = role === "MEMBER";
    const whereClause = isOwner ? {} : { workspaceId: workspaceId! };

    // Member ဆိုရင် Assigned Task ကိုသာ ထည့်စစ်ပါ
    const taskFilter = isMember ? { ...whereClause, assignedTo: userId } : whereClause;

    // ၃။ Statistics ဆွဲထုတ်ခြင်း (Promise.all ဖြင့် Performance မြှင့်တင်)
    const [totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({ where: { ...taskFilter, status: TaskStatus.COMPLETED } }),
      prisma.task.count({ where: { ...taskFilter, status: { in: [TaskStatus.TODO, TaskStatus.PENDING] } } }),
      prisma.task.count({
        where: { ...taskFilter, status: { not: TaskStatus.COMPLETED }, dueDate: { lt: new Date() } },
      }),
    ]);

    // ၄။ Admin/Owner အတွက် အပို Data များ
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
