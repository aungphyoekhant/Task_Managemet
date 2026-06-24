import express from "express";
import { userAuth } from "../middlewares/user-auth";
import { roleMiddleware } from "../middlewares/role-Middleware";
import { workspaceInvitedController } from "../controllers/workspaceInvitedController";

export const router = express.Router();

router.post("/workspace/invited", userAuth, roleMiddleware, workspaceInvitedController.inviteUser);
