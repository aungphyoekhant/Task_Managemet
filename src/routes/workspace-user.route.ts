import { workspaceUserController } from "../controllers/workspace-user.controller.js";
import { auth } from "../middlewares/authMiddleware.js";
import express from "express";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware.js";

export const router = express.Router();
router.get("/workspaces/:workspaceId/users", auth, checkWorkspaceRole(["OWNER","ADMIN"]), workspaceUserController.getWorkspaceUsers);
