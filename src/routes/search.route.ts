import { searchController } from "../controllers/search.controller";
import { auth } from "../middlewares/authMiddleware";
import express from "express";

export const router = express.Router();

router.get("/workspaceall", auth, searchController.searchWorkspaces);
router.get("/:workspaceId/projects", auth, searchController.searchProject);
router.get("/:workspaceId/users", auth, searchController.searchUsers);
router.get("/:workspaceId/:projectId/task", auth, searchController.searchTasksByTitle)
router.get("/:workspaceId/taskStatus", auth, searchController.searchTasksByStatus)