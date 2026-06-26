import express from "express";
import { userController } from "../controllers/userController";
import { auth } from "../middlewares/authMiddleware";

export const router = express.Router();

router.post("/login", userController.userLogin);
router.post("/refresh", auth, userController.refreshToken);
router.post("/logout", auth, userController.logout);
