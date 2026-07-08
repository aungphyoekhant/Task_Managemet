import { Request, Response } from "express";
import { taskService } from "../services/task.service";
import { createTaskValidator,updateTaskValidator} from "../validators/taskauth";
import { stat } from "node:fs";
import { updateAssignedTaskValidator } from "../validators/taskauth";

export const taskController = {
  createTask: async (req: Request, res: Response) => {
    try {
       const { projectId, assignedTo, title, description, priority, status, dueDate, workspaceId } = req.body;
      const userId = Number(res.locals.user.id);

      console.log(req.body)


      const {error, value} = createTaskValidator.validate({
        workspaceId,
        userId,
        projectId,
        assignedTo,
        title,
        description,
        priority,
        status,
        dueDate,
      })

      console.log(value)


      if(error){
        return res.status(400).json({con : false, msg : error.details[0].message})
      }



      // if (!userId) {
      //   return res.status(401).json({ con: false, msg: "Unauthorized" });
      // }

      // if (!projectId || !assignedTo || !title || !workspaceId) {
      //   return res.status(400).json({ con: false, msg: "Missing required fields" });
      // }

      const pId = Number(projectId);
      const targetUserId = Number(assignedTo);
      const wId = Number(workspaceId);

      const canManage = await taskService.canManageProjectTasks(pId, userId);
      if (!canManage) {
        return res.status(403).json({ con: false, msg: "Access denied: You don't have permission to manage this project" });
      }

      const newTask = await taskService.createTask({
        workspaceId: wId,
        projectId: pId,
        assignedTo: targetUserId,
        title,
        description,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      return res.status(201).json({ con: true, msg: "Task created successfully", data: newTask });


    } catch (error: any) {
      console.error("Create Task Error:", error);

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

  getTasks: async (req: Request, res: Response) => {
    try {
      const { workspaceId, cursor, limit } = req.query;

      if (!workspaceId) return res.status(400).json({ con: false, msg: "workspaceId is required" });

      const result = await taskService.getTasks(Number(workspaceId), cursor ? Number(cursor) : undefined, limit ? Number(limit) : 10);

      return res.status(200).json({ con: true, ...result });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  updateTask: async (req: Request, res: Response) => {
    try {

      const {error : paramsError} = updateTaskValidator.params.validate(req.params)

      const {error : bodyError} = updateTaskValidator.body.validate(req.body)

      if(paramsError){
        return res.status(400).json({con : false, msg : paramsError.details[0].message})
      }
      if(bodyError){
        return res.status(400).json({con : false, msg : bodyError.details[0].message})
      }

      const taskId = Number(req.params.taskId);
      const userId = res.locals.user.id;
      const { workspaceId, ...updateData } = req.body;


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

      const {error: paramsError} = updateAssignedTaskValidator.params.validate(req.params)

      const {error : bodyError, value} = updateAssignedTaskValidator.body.validate(req.body)

      if(paramsError){
        return res.status(400).json({con : false, msg : paramsError.details[0].message})
      }

      if(bodyError){
        return res.status(400).json({con : false, msg : bodyError.details[0].message})
      }


      const taskId = Number(req.params.taskId);
      const userId = res.locals.user.id;

      const task = await taskService.getTaskById(taskId);
      if (!task) return res.status(404).json({ con: false, msg: "Task not found" });

      if (task.assignedTo !== userId) {
        return res.status(403).json({ con: false, msg: "Not assigned to this task" });
      }

      const updated = await taskService.updateAssignedTask(taskId, value, userId);

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

      // userId 
      await taskService.deleteTask(taskId, userId);

      return res.status(200).json({ con: true, msg: "Deleted" });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },
};
