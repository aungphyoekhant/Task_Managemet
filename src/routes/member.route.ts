import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { memberController } from "../controllers/member.controller.js";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware.js";

export const router = express.Router();

router.delete("/workspaces/:workspaceId/members/:userId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), memberController.deleteMember);
