import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { workspaceInvitedController } from "../controllers/workspace_invited.controller";

export const router = express.Router();

router.post("/invited", auth, workspaceInvitedController.inviteUser);
