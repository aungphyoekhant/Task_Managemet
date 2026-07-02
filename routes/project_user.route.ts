import express from "express";
import { projectUserController } from "../controllers/project_user.controller";
import { auth } from "../middlewares/authMiddleware";

export const router = express.Router();

router.get("/projects/:projectId/members", auth, projectUserController.getAllProjectMembers);

router.post("/projects/members", auth, projectUserController.addMember);

router.delete("/members/:projectUserId", auth, projectUserController.removeMember);
