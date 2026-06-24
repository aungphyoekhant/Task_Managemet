import { invitationController } from "../controllers/invitationController";
import express from "express";
export const router = express.Router();

router.get("/acceptInvitation", invitationController.acceptInvitation);
