import express from "express";
import { authUserController } from "../controllers/authUserController";
import { auth } from "../middlewares/authMiddleware";

export const router = express.Router();

router.post("/register", authUserController.register);
router.post("/login", authUserController.login);
router.delete("/logout", auth, authUserController.logout);
