import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { memberController } from "../controllers/member.controller";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();

router.delete("/:workspaceId/members/:userId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), memberController.deleteMember);
