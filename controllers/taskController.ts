import { Request, Response } from "express";
import { taskService } from "../services/taskServices";
import { prisma } from "../lib/prisma";

export const taskController = {
  createTask: async (req: Request, res: Response) => {
    try {
      const { workspaceId, projectId, projectUserId, title, description, priority, status, dueDate } = req.body;
      const userId = res.locals.user.id;

      if (!(await taskService.canManageProjectTasks(Number(projectId), userId))) {
        return res.status(403).json({ con: false, msg: "Access denied" });
      }

      const member = await prisma.projectUser.findFirst({ where: { id: Number(projectUserId), projectId: Number(projectId) } });
      if (!member) return res.status(400).json({ con: false, msg: "Member not found" });

      const newTask = await taskService.createTask({
        workspaceId,
        projectId,
        projectUserId,
        title,
        description,
        priority,
        status,
        dueDate,
        assignedTo: member.userId,
      });

      return res.status(201).json({ con: true, msg: "Task created successfully", data: newTask });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
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
      const task = await taskService.getTaskById(Number(req.params.taskId));
      if (!task || !(await taskService.canManageProjectTasks(task.projectId, res.locals.user.id))) {
        return res.status(403).json({ con: false, msg: "Unauthorized" });
      }

      // ပြင်လို့ရတဲ့ field တွေကိုပဲ ရွေးယူ (Destructuring)
      const { title, description, priority, status, dueDate, projectUserId } = req.body;

      // လိုအပ်တဲ့ field တွေပဲ object ထဲထည့်မယ်
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) updateData.status = status;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (projectUserId !== undefined) updateData.projectUserId = projectUserId;

      const updatedTask = await taskService.updateTask(Number(req.params.taskId), updateData);
      return res.status(200).json({ con: true, data: updatedTask });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  updateAssignedTask: async (req: Request, res: Response) => {
    try {
      const task = await taskService.getTaskById(Number(req.params.taskId));
      if (!task) return res.status(404).json({ con: false, msg: "Task not found" });

      if (task.assignedTo !== res.locals.user.id) {
        return res.status(403).json({ con: false, msg: "Not assigned to this task" });
      }

      // Member က ပြင်လို့ရတဲ့ field တွေကိုပဲ ရွေးယူမယ်
      const { status, priority } = req.body;

      // အခြား field တွေ (title, description) ပို့လာရင်တောင် ဒီမှာ မထည့်ပေးတဲ့အတွက် မပြင်နိုင်တော့ဘူး
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;

      const updated = await taskService.updateAssignedTask(Number(req.params.taskId), updateData);
      return res.status(200).json({ con: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  deleteTask: async (req: Request, res: Response) => {
    try {
      const task = await taskService.getTaskById(Number(req.params.taskId));
      if (!task || !(await taskService.canManageProjectTasks(task.projectId, res.locals.user.id))) {
        return res.status(403).json({ con: false, msg: "Unauthorized" });
      }

      await taskService.deleteTask(Number(req.params.taskId));
      return res.status(200).json({ con: true, msg: "Deleted" });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },
};
