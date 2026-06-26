import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { checkProjectPermission } from "../middlewares/projectAuth";
import { projectController } from "../controllers/projectController";

export const router = express.Router();

router.post("/:workspaceId/projects", auth, checkProjectPermission, projectController.createProject);
