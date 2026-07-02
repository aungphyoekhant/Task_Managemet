import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { projectController } from "../controllers/project.controller";

export const router = express.Router();

router.post("/projects", auth, projectController.createProject);
router.get("/:workspaceId/projects", auth, projectController.getAllProjects);
router.get("/:workspaceId/projects/:projectId", auth, projectController.getProjectById);
router.put("/projects/:projectId", auth, projectController.updateProject);
router.delete("/:workspaceId/projects/:projectId", auth, projectController.deleteProject);
