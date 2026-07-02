import { Request, Response } from "express";
import { projectService } from "../services/project.service";

export const projectController = {
  // 1. Get All Projects
  getAllProjects: async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.params;
      if (!workspaceId) return res.status(400).json({ con: false, msg: "workspaceId is required in body" });

      const projects = await projectService.getAllProjects(Number(workspaceId));
      return res.status(200).json({ con: true, msg: "Projects Fetched", data: projects });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error fetching projects" });
    }
  },

  // 2. Get Project By ID
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

  createProject: async (req: Request, res: Response) => {
    try {
      const { role, id: userId } = res.locals.user;

      if (role !== "OWNER" && role !== "ADMIN") {
        return res.status(403).json({
          con: false,
          msg: "Access denied: Only Owners and Admins can create projects",
        });
      }

      const { projectName, description, startDate, endDate, workspaceId } = req.body;

      if (!projectName || !workspaceId) {
        return res.status(400).json({ con: false, msg: "Project name and workspaceId are required" });
      }

      const project = await projectService.createProject({
        projectName,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        workspaceId: Number(workspaceId),
        createBy: userId,
      });

      return res.status(201).json({
        con: true,
        msg: "Project created successfully",
        data: project,
      });
    } catch (error: any) {
      if (error.code === "P2003") {
        return res.status(400).json({ con: false, msg: "Invalid workspaceId: Workspace does not exist" });
      }
      console.error("Create Project Error:", error);
      return res.status(500).json({ con: false, msg: "Internal Server Error" });
    }
  },

  // 4. Update Project
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
      return res.status(500).json({ con: false, msg: "Error updating project" });
    }
  },

  // 5. Delete Project
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
      return res.status(500).json({ con: false, msg: "Error deleting project" });
    }
  },
};
