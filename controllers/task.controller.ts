import { Request, Response } from "express";
import { taskService } from "../services/task.service";

export const taskController = {
  createTask: async (req: Request, res: Response) => {
    try {
      const { projectId, assignedTo, title, description, priority, status, dueDate, workspaceId } = req.body;
      const { id: userId } = res.locals.user;

      if (!projectId || !assignedTo || !title || !workspaceId) {
        return res.status(400).json({ con: false, msg: "Missing required fields (projectId, assignedTo, title, workspaceId)" });
      }

      // ၂။ ပိုင်ဆိုင်မှုစစ်ဆေးခြင်း
      if (!(await taskService.canManageProjectTasks(Number(projectId), userId))) {
        return res.status(403).json({ con: false, msg: "Access denied" });
      }

      const newTask = await taskService.createTask({
        workspaceId: Number(workspaceId),
        projectId: Number(projectId),
        assignedTo: Number(assignedTo),
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      return res.status(201).json({ con: true, msg: "Task created successfully", data: newTask });
    } catch (error: any) {
      console.error("Create Task Error:", error);

      if (error.message === "Member not found") {
        return res.status(400).json({ con: false, msg: "User is not a member of this project" });
      }

      if (error.code === "P2003") {
        return res.status(400).json({ con: false, msg: "Invalid reference ID (Workspace or Project)" });
      }

      return res.status(500).json({ con: false, msg: error.message || "Internal Server Error" });
    }
  },

  getTaskById: async (req: Request, res: Response) => {
    try {
      const task = await taskService.getTaskById(Number(req.params.taskId));
      if (!task) return res.status(404).json({ con: false, msg: "Task not found" });
      return res.status(200).json({ con: true, data: task });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  updateTask: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = res.locals.user.id;
      const { workspaceId, ...updateData } = req.body;

      if (!workspaceId) {
        return res.status(400).json({ con: false, msg: "workspaceId is required" });
      }

      const task = await taskService.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ con: false, msg: "Task not found" });
      }

      const canManage = await taskService.canManageProjectTasks(task.projectId, userId);
      if (!canManage) {
        return res.status(403).json({ con: false, msg: "Unauthorized" });
      }

      const updatedTask = await taskService.updateTask(taskId, updateData, userId);

      return res.status(200).json({ con: true, data: updatedTask });
    } catch (error: any) {
      console.error("Update Task Error:", error);
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  updateAssignedTask: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = res.locals.user.id;

      const task = await taskService.getTaskById(taskId);
      if (!task) return res.status(404).json({ con: false, msg: "Task not found" });

      if (task.assignedTo !== userId) {
        return res.status(403).json({ con: false, msg: "Not assigned to this task" });
      }

      const { status, priority } = req.body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;

      const updated = await taskService.updateAssignedTask(taskId, updateData, userId);

      return res.status(200).json({ con: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  deleteTask: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = res.locals.user.id; // User ID ကို ရယူပါ

      const task = await taskService.getTaskById(taskId);
      if (!task || !(await taskService.canManageProjectTasks(task.projectId, userId))) {
        return res.status(403).json({ con: false, msg: "Unauthorized" });
      }

      // userId ကို Argument အနေနဲ့ ထည့်ပေးလိုက်ပါ
      await taskService.deleteTask(taskId, userId);

      return res.status(200).json({ con: true, msg: "Deleted" });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },
};
