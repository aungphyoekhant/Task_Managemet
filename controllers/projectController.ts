import { Request, Response } from "express";
import { projectService } from "../services/projectServices";

export const projectController = {
  // 1. Get All Projects (အဖွဲ့ဝင်တိုင်း ကြည့်နိုင်သည်)
  getAllProjects: async (req: Request, res: Response) => {
    try {
      const workspaceId = Number(req.params.workspaceId);
      if (isNaN(workspaceId)) return res.status(400).json({ con: false, msg: "Invalid workspaceId" });

      const projects = await projectService.getAllProjects(workspaceId);
      return res.status(200).json({ con: true, msg: "Projects Fetched", data: projects });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error fetching projects" });
    }
  },

  // 2. Get Project By ID (အဖွဲ့ဝင်တိုင်း ကြည့်နိုင်သည်)
  getProjectById: async (req: Request, res: Response) => {
    try {
      const projectId = Number(req.params.projectId);
      const project = await projectService.getProjectById(projectId);
      if (!project) return res.status(404).json({ con: false, msg: "Project not found" });
      return res.status(200).json({ con: true, msg: "Project Fetched", data: project });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error fetching project" });
    }
  },

  // 3. Create Project (Admin သို့မဟုတ် Owner သာ)
  createProject: async (req: Request, res: Response) => {
    try {
      const { role, id: userId } = res.locals.user; // auth middleware မှ role နှင့် id ရယူ

      if (role !== "ADMIN" && role !== "OWNER") {
        return res.status(403).json({ con: false, msg: "Access denied: Admin or Owner only" });
      }

      const { workspaceId, projectName, description, startDate, endDate } = req.body;
      if (!workspaceId || !projectName || !description || !startDate || !endDate) {
        return res.status(400).json({ con: false, msg: "Missing required fields" });
      }

      const project = await projectService.createProject({
        projectName,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        workspaceId: Number(workspaceId),
        createBy: userId,
      });

      return res.status(201).json({ con: true, msg: "Project created successfully", data: project });
    } catch (error) {
      console.error("Create Project Error:", error);
      return res.status(500).json({ con: false, msg: "Internal Server Error" });
    }
  },

  // 4. Update Project (Admin သို့မဟုတ် Owner သာ)
  updateProject: async (req: Request, res: Response) => {
    try {
      const { role } = res.locals.user;
      if (role !== "ADMIN" && role !== "OWNER") {
        return res.status(403).json({ con: false, msg: "Access denied: Admin or Owner only" });
      }

      const projectId = Number(req.params.projectId);
      const { name, description, startDate, endDate } = req.body;

      if (!name || !description || !startDate || !endDate) {
        return res.status(400).json({ con: false, msg: "Missing required fields" });
      }

      const updatedProject = await projectService.updateProject(projectId, { name, description, startDate, endDate });
      return res.status(200).json({ con: true, msg: "Project updated", data: updatedProject });
    } catch (error) {
      console.error("Update Project Error:", error);
      return res.status(500).json({ con: false, msg: "Error updating project" });
    }
  },

  // 5. Delete Project (Admin သို့မဟုတ် Owner သာ)
  deleteProject: async (req: Request, res: Response) => {
    try {
      const { role } = res.locals.user;
      if (role !== "ADMIN" && role !== "OWNER") {
        return res.status(403).json({ con: false, msg: "Access denied: Admin or Owner only" });
      }

      const projectId = Number(req.params.projectId);
      await projectService.deleteProject(projectId);
      return res.status(200).json({ con: true, msg: "Project deleted successfully" });
    } catch (error) {
      console.error("Delete Project Error:", error);
      return res.status(500).json({ con: false, msg: "Error deleting project" });
    }
  },
};
