import express from "express";
import { authUserController } from "../controllers/authUserController";
import { userAuth } from "../middlewares/user-auth";

export const router = express.Router();

router.post("/register", authUserController.register);
router.post("/login", authUserController.login);
router.delete("/logout", userAuth, authUserController.logout);
