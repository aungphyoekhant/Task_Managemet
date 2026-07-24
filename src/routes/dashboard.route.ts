import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

export const router = express.Router();

router.get("/dashboard/workspace/:workspaceId", auth, getDashboardStats);
