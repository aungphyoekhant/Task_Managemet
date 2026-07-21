import { Request, Response } from "express";
import { taskUserService } from "../services/task_user.service";

export const taskUserController = {
  // 1. Task သို့ Member Assign လုပ်ရန် Controller
  assignUser: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const { userIdToAssign, workspaceId, projectId } = req.body;
      
      const currentUserId = res.locals.user.id;

      const result = await taskUserService.assignUserToTask({
        taskId,
        userIdToAssign: Number(userIdToAssign),
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
      const userIdToRemove = Number(req.params.userId);
      const workspaceId = Number(req.query.workspaceId || req.body.workspaceId);
      
      // @ts-ignore
      const currentUserId = res.locals.user.id || req.user?.id || req.body.currentUserId;

      const result = await taskUserService.removeUserFromTask(taskId, userIdToRemove, currentUserId, workspaceId);

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

  // 3. Task တစ်ခုခု၏ Assignees များကို ဆွဲထုတ်ရန် Controller
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