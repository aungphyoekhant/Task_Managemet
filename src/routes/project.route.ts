import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { projectController } from "../controllers/project.controller.js";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware.js";

export const router = express.Router();

router.post("/workspaces/projects", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.createProject);

router.get("/workspaces/:workspaceId/projects", auth,projectController.getAllProjects);

router.get("/workspaces/:workspaceId/projects/:projectId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.getProjectById);

router.put("/workspaces/:workspaceId/projects/:projectId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.updateProject);

router.delete("/workspaces/:workspaceId/projects/:projectId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.deleteProject);

