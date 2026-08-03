import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { getAllWorkspacesStats, getDashboardStats } from "../controllers/dashboard.controller.js";
export const router = express.Router();
router.get("/allworkspaces/stats", auth, getAllWorkspacesStats);
router.get("/dashboard/workspace/:workspaceId", auth, getDashboardStats);
