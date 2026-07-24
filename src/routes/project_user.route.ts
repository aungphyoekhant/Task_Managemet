import express from "express";
import { projectUserController } from "../controllers/project_user.controller.js";
import { auth } from "../middlewares/authMiddleware.js";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware.js";

export const router = express.Router();

router.get("/projects/:projectId/projectUsers", auth, projectUserController.getAllProjectMembers);

router.post("/projects/projectUsers", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), projectUserController.addMember);

router.delete(
  "/projects/:projectId/projectUsers/:projectUserId",
  auth, 
  projectUserController.removeMember
);