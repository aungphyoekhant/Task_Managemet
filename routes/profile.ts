import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { profileController } from "../controllers/profileController";
import { upload } from "../middlewares/upload";

export const router = express.Router();

router.get("/profile", profileController.getProfile);
router.put("/profile", auth, upload.single("avatar"), profileController.upsertProfile);
