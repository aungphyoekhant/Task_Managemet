import express from "express";
import { userController } from "../controllers/user.controller.js";
import { auth } from "../middlewares/authMiddleware.js";

export const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", auth, userController.logout);
router.post("/refresh", userController.refreshToken);
