import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { workspaceInvitedController } from "../controllers/workspaceInvitedController";

export const router = express.Router();

router.post("/workspace/invited", auth, workspaceInvitedController.inviteUser);
