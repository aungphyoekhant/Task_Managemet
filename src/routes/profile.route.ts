import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { profileController } from "../controllers/profile.controller";
import { upload } from "../middlewares/upload";

export const router = express.Router();

router.get("/profile", auth, profileController.getProfile);
router.post("/profile", auth, upload.single("avatar"), profileController.upsertProfile);
