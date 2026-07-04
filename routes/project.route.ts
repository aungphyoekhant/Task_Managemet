import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { projectController } from "../controllers/project.controller";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();

router.post("/projects", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.createProject);
router.get("/:workspaceId/projects", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.getAllProjects);
router.get("/:workspaceId/projects/:projectId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.getProjectById);
router.put("/projects/:projectId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.updateProject);
router.delete("/:workspaceId/projects/:projectId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectController.deleteProject);
