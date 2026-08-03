import { Request, Response } from "express";
import { taskUserService } from "../services/task_user.service.js";

export const taskUserController = {
  assignUser: async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);
    const { userIdToAssign, workspaceId, projectId } = req.body;


    console.log(req.body)
    
    const currentUserId = res.locals.user?.id;

    if (!userIdToAssign || isNaN(Number(userIdToAssign))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing 'userId' in request body.",
      });
    }

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing 'workspaceId' in request body.",
      });
    }

    if (!projectId || isNaN(Number(projectId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing 'projectId' in request body.",
      });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'taskId' in URL parameters.",
      });
    }

    // 🔴 2. Service ခေါ်ယူခြင်း
    const result = await taskUserService.assignUserToTask({
      taskId,
      userId: Number(userIdToAssign),
      currentUserId: Number(currentUserId),
      workspaceId: Number(workspaceId),
      projectId: Number(projectId),
    });

    return res.status(201).json({
      success: true,
      message: "User successfully assigned to task.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to assign user to task.",
    });
  }
},

  removeUser: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.params.userId);
      const workspaceId = Number(req.query.workspaceId || req.params.workspaceId);
      
      // @ts-ignore
      const currentUserId = res.locals.user.id || req.user?.id || req.body.currentUserId;

      const result = await taskUserService.removeUserFromTask(taskId, userId, currentUserId, workspaceId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to remove user from task.",
      });
    }
  },

  getAssignees: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);

      const assignees = await taskUserService.getTaskAssignees(taskId);

      return res.status(200).json({
        success: true,
        data: assignees,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch task assignees.",
      });
    }
  },
};