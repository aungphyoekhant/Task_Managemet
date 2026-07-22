import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { workspaceInvitedController } from "../controllers/workspace_invited.controller";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();

router.post("/invited",auth,  checkWorkspaceRole(["OWNER"]), workspaceInvitedController.inviteUser);

router.get("/workspaces/:workspaceId/invitations", auth, checkWorkspaceRole(["OWNER"]), workspaceInvitedController.getInvitations);
