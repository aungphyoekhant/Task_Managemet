import express from "express";
import { userController } from "../controllers/userController";
import { userAuth } from "../middlewares/user-auth";

export const router = express.Router();

router.post("/login", userController.userLogin);
router.post("/refresh", userAuth, userController.refreshToken);
router.post("/logout", userAuth, userController.logout);
