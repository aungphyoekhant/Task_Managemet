import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { checkInvitePermission } from "../middlewares/inviteAuth";
import { workspaceInvitedController } from "../controllers/workspaceInvitedController";

export const router = express.Router();

router.post("/workspace/invited", auth, checkInvitePermission, workspaceInvitedController.inviteUser);
