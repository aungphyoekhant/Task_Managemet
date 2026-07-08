import { Request, Response } from "express";
import { projectService } from "../services/project.service";
import { authService } from "../services/auth.service";
import { number } from "joi";
import { createProjectValidator, updateProjectValidator } from "../validators/projectauth";

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

  createProject: async (req: Request , res: Response) => {

    const {error , value} = createProjectValidator.validate(req.body)

    if(error){
      return res.status(400).json({con : false, msg : error.details[0].message})
    }

    const { projectName, description, startDate, endDate, workspaceId } = req.body;

    const userId = res.locals.user.id;

    try {
      const member = await authService.getWorkspaceUserRole({ userId, workspaceId: Number(workspaceId) });

      if (!member) {
        return res.status(404).json({ con: false, msg: "Not a member of this workspace" });
      }

      if (member.role !== "OWNER" && member.role !== "ADMIN") {
        return res.status(403).json({ con: false, msg: "Access denied" });
      }

      console.log(member.role);

      const project = await projectService.createProject({
        projectName,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        workspaceId : Number(workspaceId),
        createBy: userId,
      });

      return res.status(201).json({
        con: true,
        msg: "Project created successfully",
        data: project,
      });
    } catch (error: any) {
      console.error("Create Project Error:", error);
      return res.status(500).json({ con: false, msg: "Internal Server Error" });
    }
  },
  // 4. Update Project
  updateProject: async (req: Request, res: Response) => {
    try {

      const {error : paramsError, value : paramsValue} = updateProjectValidator.params.validate(req.params)

      const {error : bodyError, value: bodyValue} = updateProjectValidator.body.validate(req.body)

      if(paramsError){
        return res.status(400).json({con : false, msg : paramsError.details[0].message})
      }

      if(bodyError){
        return res.status(400).json({con : false, msg : bodyError.details[0].message})
      }

      const {projectId, workspaceId} = paramsValue;
      
      

      const updatedProject = await projectService.updateProject(Number(projectId), bodyValue);

      return res.status(200).json({ con: true, msg: "Project updated", data: updatedProject });

      
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error updating project" });
    }
  },

  // 5. Delete Project
  deleteProject: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.id;
      const workspaceId = Number(req.params.workspaceId);
      const projectId = Number(req.params.projectId);

      if (!projectId) return res.status(400).json({ con: false, msg: "ProjectId is required" });

      const data = await authService.getWorkspaceUserRole({ userId, workspaceId });

      if (!data) {
        return res.status(404).json({ con: false, msg: "Workspace not found" });
      }
      if (data.role !== "ADMIN" && data.role !== "OWNER") {
        return res.status(403).json({ con: false, msg: "Access denied: Admin or Owner only" });
      }
      await projectService.deleteProject(projectId);
      return res.status(200).json({ con: true, msg: "Project deleted successfully" });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error deleting project" });
    }
  },
};
