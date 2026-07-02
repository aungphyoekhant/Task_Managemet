import { invitationController } from "../controllers/invitation.controller";
import express from "express";
export const router = express.Router();

router.post("/accept", invitationController.acceptInvitation);
