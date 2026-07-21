import express from "express";
import { projectUserController } from "../controllers/project_user.controller";
import { auth } from "../middlewares/authMiddleware";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();

router.get("/projects/:projectId/projectUsers", auth, projectUserController.getAllProjectMembers);

router.post("/projects/projectUsers", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectUserController.addMember);

router.delete(
  "/projects/:projectId/projectUsers/:projectUserId",
  auth, 
  projectUserController.removeMember
);