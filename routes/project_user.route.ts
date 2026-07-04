import express from "express";
import { projectUserController } from "../controllers/project_user.controller";
import { auth } from "../middlewares/authMiddleware";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();

router.get("/projects/:projectId/members", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectUserController.getAllProjectMembers);

router.post("/projects/members", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectUserController.addMember);

router.delete("/members/:projectUserId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectUserController.removeMember);
