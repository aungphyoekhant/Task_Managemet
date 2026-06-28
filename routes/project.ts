import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { checkProjectPermission } from "../middlewares/projectAuth";
import { projectController } from "../controllers/projectController";

export const router = express.Router();

router.post("/projects", auth, checkProjectPermission, projectController.createProject);
router.get("/:workspaceId/projects", auth, checkProjectPermission, projectController.getAllProjects);
router.get("/:workspaceId/projects/:projectId", auth, checkProjectPermission, projectController.getProjectById);
router.put("/projects/:projectId", auth, checkProjectPermission, projectController.updateProject);
router.delete("/:workspaceId/projects/:projectId", auth, checkProjectPermission, projectController.deleteProject);
