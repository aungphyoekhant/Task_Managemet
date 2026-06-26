import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { memberController } from "../controllers/memberController";

export const router = express.Router();

router.delete("/:workspaceId/members/:userId", auth, memberController.deleteMember);
