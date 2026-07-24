import { activityController } from "../controllers/activity.controller.js";
import { auth } from "../middlewares/authMiddleware.js";
import express from "express";

export const router = express.Router();
router.get("/activity", auth, activityController.getActivityLogs);
