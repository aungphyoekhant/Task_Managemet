import express from "express";
import { projectUserController } from "../controllers/projectUserController";
import { auth } from "../middlewares/authMiddleware";

export const router = express.Router();

router.get("/projects/:projectId/members", auth, projectUserController.getProjectMembers);

router.post("/projects/members", auth, projectUserController.addMember);

router.delete("/members/:projectUserId", auth, projectUserController.removeMember);
