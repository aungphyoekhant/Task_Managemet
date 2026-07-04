import { searchController } from "../controllers/search.controller";
import { auth } from "../middlewares/authMiddleware";
import express from "express";

export const router = express.Router();

router.get("/workspaceall", auth, searchController.searchWorkspaces);
router.get("/:workspaceId/projects", auth, searchController.searchProjects);
router.get("/:workspaceId/tasks", auth, searchController.searchTasks);
router.get("/:workspaceId/users", auth, searchController.searchUsers);
router.get("/:workspaceId/global", auth, searchController.globalSearch);
