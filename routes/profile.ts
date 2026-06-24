import express from "express";
import { userAuth } from "../middlewares/user-auth";
import { profileController } from "../controllers/profileController";

export const router = express.Router();

router.get("/profile", userAuth, profileController.getProfile);
router.post("/profile", userAuth, profileController.upsertProfile);
