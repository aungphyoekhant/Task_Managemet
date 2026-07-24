import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { profileController } from "../controllers/profile.controller.js";
import { upload } from "../middlewares/upload.js";

export const router = express.Router();

router.get("/profile", auth, profileController.getProfile);
router.post("/profile", auth, upload.single("avatar"), profileController.upsertProfile);
