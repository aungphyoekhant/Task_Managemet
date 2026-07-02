import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { updateRoleController } from "../controllers/update_role.controller";
import { roleMiddleware } from "../middlewares/role-Middleware";

export const router = express.Router();

router.post("/updateRole", auth, roleMiddleware, updateRoleController.updateRole);
