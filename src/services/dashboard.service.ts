import { prisma } from "../lib/prisma.js";
import { TaskStatus, ProjectStatus, Prisma } from "../../generated/prisma/client.js";
import { WorkspaceUserRole } from "../types/global.js";

// Task Status Weight Definition
const TASK_STATUS_WEIGHT: Record<TaskStatus, number> = {
  TODO: 0,
  IN_PROGRESS: 50,
  DONE: 100,
};

// Explicit Select Definition for Project with Nested Tasks & TaskUsers
const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  tasks: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      taskUsers: {
        select: {
          userId: true,
        },
      },
    },
  },
} as const;

type ProjectWithTasks = Prisma.ProjectGetPayload<{
  select: typeof projectSelect;
}>;

export const dashboardService = {

  // 🎯 1. SINGLE WORKSPACE DASHBOARD STATS
  getDashboardStats: async ({ userId, workspaceId, role }: WorkspaceUserRole) => {
    const isMember = role === "MEMBER";
    const whereClause = { workspaceId };

    // 1. Task filter strictly matching TaskUser model
    const taskFilter: Prisma.TaskWhereInput = isMember
      ? { ...whereClause, taskUsers: { some: { userId } } }
      : whereClause;

    // 2. Project filter using TaskUser relation for Members
    const projectFilter: Prisma.ProjectWhereInput = isMember
      ? {
          workspaceId,
          tasks: {
            some: {
              taskUsers: {
                some: {
                  userId,
                },
              },
            },
          },
        }
      : whereClause;

    // 3. Parallel Database Queries Execution
    const [totalTasks, completedTasks, pendingTasks, overdueTasks, rawProjects] = await Promise.all([
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({ where: { ...taskFilter, status: TaskStatus.DONE } }),
      prisma.task.count({
        where: { ...taskFilter, status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } },
      }),
      prisma.task.count({
        where: { ...taskFilter, status: { not: TaskStatus.DONE }, dueDate: { lt: new Date() } },
      }),
      prisma.project.findMany({
        where: projectFilter,
        select: {
          ...projectSelect,
          tasks: {
            where: isMember ? { taskUsers: { some: { userId } } } : undefined,
            select: projectSelect.tasks.select,
          },
        },
      }),
    ]);

    const projects = rawProjects as unknown as ProjectWithTasks[];

    // 4. Transform & Calculate Progress Percentages
    const projectSummaries = projects.map((project) => {
      const projectTotalTasks = project.tasks.length;

      const todoCount = project.tasks.filter((t) => t.status === TaskStatus.TODO).length;
      const inProgressCount = project.tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
      const doneCount = project.tasks.filter((t) => t.status === TaskStatus.DONE).length;

      let progressPercentage = 0;
      if (projectTotalTasks > 0) {
        const totalWeight = project.tasks.reduce(
          (sum, task) => sum + TASK_STATUS_WEIGHT[task.status],
          0
        );
        progressPercentage = Math.round(totalWeight / projectTotalTasks);
      } else if (project.status === ProjectStatus.COMPLETED) {
        progressPercentage = 100;
      }

      const tasksWithProgress = project.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        progressPercentage: TASK_STATUS_WEIGHT[task.status],
        assigneeIds: task.taskUsers.map((tu) => tu.userId),
      }));

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        progressPercentage,
        taskOverview: {
          totalTasks: projectTotalTasks,
          todoCount,
          inProgressCount,
          doneCount,
        },
        tasks: tasksWithProgress,
      };
    });

    // 5. Admin & Owner Additional Statistics
    let extraStats = {};
    if (!isMember) {
      const [totalProjects, totalMembers, pendingProjects, activeProjects, completedProjects] = await Promise.all([
        prisma.project.count({ where: whereClause }),
        prisma.workspaceUser.count({ where: whereClause }),
        prisma.project.count({ where: { ...whereClause, status: ProjectStatus.PENDING } }),
        prisma.project.count({ where: { ...whereClause, status: ProjectStatus.ACTIVE } }),
        prisma.project.count({ where: { ...whereClause, status: ProjectStatus.COMPLETED } }),
      ]);

      extraStats = {
        totalProjects,
        totalMembers,
        projectStatusOverview: {
          pending: pendingProjects,
          active: activeProjects,
          completed: completedProjects,
        },
      };
    }

    // 6. Monthly Chart Data Aggregation for this Workspace
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyCountsMap = monthNames.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {} as Record<string, number>);

    projects.forEach((proj) => {
      if (proj.startDate) {
        const date = new Date(proj.startDate);
        const monthName = monthNames[date.getMonth()];
        if (monthlyCountsMap[monthName] !== undefined) {
          monthlyCountsMap[monthName] += 1;
        }
      }
    });

    const monthlyUsers = monthNames.map((month) => ({
      month,
      users: monthlyCountsMap[month],
    }));

    const overallTaskCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return {
      role,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        overallTaskCompletionRate,
        ...extraStats,
      },
      monthlyUsers,
      projects: projectSummaries,
    };
  },

  // 🌐 2. ALL WORKSPACES STATS (User ဝင်ရောက်ခွင့်ရှိသော Workspace များကိုသာ Filter လုပ်ပေးသည်)
  getAllWorkspacesStats: async (userId: number) => {
    // 🔍 User ကိုယ်တိုင် Member အဖြစ် ပါဝင်သော Workspace များကိုသာ သတ်မှတ်ခြင်း
    const workspaceWhere = {
      workspaceUsers: {
        some: {
          userId: userId,
        },
      },
    };

    const [
      totalWorkspaces,
      totalProjects,
      totalTasks,
      totalWorkspaceMembers,
      totalProjectMembers,
      totalTaskUsers,
      // Task Status Summaries
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      // Project Status Summaries
      pendingProjects,
      activeProjects,
      completedProjects,
      // Workspace-wise Details with nested breakdown
      workspacesData,
    ] = await Promise.all([
      // 1. Filtered Global Counts
      prisma.workspace.count({ where: workspaceWhere }),
      prisma.project.count({ where: { workspace: workspaceWhere } }),
      prisma.task.count({ where: { project: { workspace: workspaceWhere } } }),
      prisma.workspaceUser.count({ where: { workspace: workspaceWhere } }),
      prisma.projectUser.count({ where: { project: { workspace: workspaceWhere } } }),
      prisma.taskUser.count({ where: { task: { project: { workspace: workspaceWhere } } } }),

      // 2. Filtered Task Status Counts
      prisma.task.count({ 
        where: { 
          status: TaskStatus.TODO, 
          project: { workspace: workspaceWhere } 
        } 
      }),
      prisma.task.count({ 
        where: { 
          status: TaskStatus.IN_PROGRESS, 
          project: { workspace: workspaceWhere } 
        } 
      }),
      prisma.task.count({ 
        where: { 
          status: TaskStatus.DONE, 
          project: { workspace: workspaceWhere } 
        } 
      }),
      prisma.task.count({
        where: {
          status: { not: TaskStatus.DONE },
          dueDate: { lt: new Date() },
          project: { workspace: workspaceWhere },
        },
      }),

      // 3. Filtered Project Status Counts
      prisma.project.count({ 
        where: { 
          status: ProjectStatus.PENDING, 
          workspace: workspaceWhere 
        } 
      }),
      prisma.project.count({ 
        where: { 
          status: ProjectStatus.ACTIVE, 
          workspace: workspaceWhere 
        } 
      }),
      prisma.project.count({ 
        where: { 
          status: ProjectStatus.COMPLETED, 
          workspace: workspaceWhere 
        } 
      }),

      // 4. Filtered Workspace List with details
      prisma.workspace.findMany({
        where: workspaceWhere,
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              workspaceUsers: true,
              projects: true,
              tasks: true,
            },
          },
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              _count: {
                select: {
                  projectUsers: true,
                  tasks: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Global Completion Rate
    const overallTaskCompletionRate =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Monthly Chart Data Aggregation (Jan - Dec)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const monthlyCountsMap = monthNames.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {} as Record<string, number>);

    workspacesData.forEach((ws) => {
      if (ws.createdAt) {
        const date = new Date(ws.createdAt);
        const monthName = monthNames[date.getMonth()];
        if (monthlyCountsMap[monthName] !== undefined) {
          monthlyCountsMap[monthName] += 1;
        }
      }
    });

    const monthlyUsers = monthNames.map((month) => ({
      month,
      users: monthlyCountsMap[month],
    }));

    return {
      summaryCounts: {
        totalWorkspaces,
        totalProjects,
        totalTasks,
        totalWorkspaceMembers,
        totalProjectMembers,
        totalTaskUsers,
      },
      statusOverview: {
        tasks: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          done: doneTasks,
          overdue: overdueTasks,
          completionRatePercentage: overallTaskCompletionRate,
        },
        projects: {
          total: totalProjects,
          pending: pendingProjects,
          active: activeProjects,
          completed: completedProjects,
        },
      },
      monthlyUsers,
      workspaces: workspacesData.map((ws) => ({
        id: ws.id,
        name: ws.name,
        createdAt: ws.createdAt,
        counts: {
          workspaceMembers: ws._count.workspaceUsers,
          projects: ws._count.projects,
          tasks: ws._count.tasks,
        },
        projects: ws.projects.map((proj) => ({
          id: proj.id,
          name: proj.name,
          status: proj.status,
          projectMembersCount: proj._count.projectUsers,
          tasksCount: proj._count.tasks,
        })),
      })),
    };
  }
};