import { workspaceUserController } from "../controllers/workspace-user.controller";
import { auth } from "../middlewares/authMiddleware";
import express from "express";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();
router.get("/workspaces/:workspaceId/users", auth, checkWorkspaceRole(["OWNER"]), workspaceUserController.getWorkspaceUsers);
