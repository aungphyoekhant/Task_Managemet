import { activityController } from "../controllers/activity.controller";
import { auth } from "../middlewares/authMiddleware";
import express from "express";

export const router = express.Router();
router.get("/logs/:workspaceId", auth, activityController.getActivityLogs);
