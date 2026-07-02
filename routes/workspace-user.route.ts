import { workspaceUserController } from "../controllers/workspace-user.controller";
import { auth } from "../middlewares/authMiddleware";
import express from "express";

export const router = express.Router();
router.get("/workspaces/:workspaceId/users", auth, workspaceUserController.getWorkspaceUsers);
