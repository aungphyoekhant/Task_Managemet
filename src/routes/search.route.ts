import { searchController } from "../controllers/search.controller.js";
import { auth } from "../middlewares/authMiddleware.js";
import express from "express";

export const router = express.Router();

router.get("/workspaceall", auth, searchController.searchWorkspaces);
router.get("/:workspaceId/projects", auth, searchController.searchProject);
router.get("/:workspaceId/users", auth, searchController.searchUsers);
router.get("/:workspaceId/:projectId/task", auth, searchController.searchTasksByTitle)
router.get("/:workspaceId/taskStatus", auth, searchController.searchTasksByStatus)