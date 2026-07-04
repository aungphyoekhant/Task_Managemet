import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { getDashboardStats } from "../controllers/dashboard.controller";

export const router = express.Router();

router.get("/dashboard/workspace/:workspaceId", auth, getDashboardStats);
