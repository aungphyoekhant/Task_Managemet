import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { profileController } from "../controllers/profileController";

export const router = express.Router();

router.get("/profile", auth, profileController.getProfile);
router.post("/profile", auth, profileController.upsertProfile);
