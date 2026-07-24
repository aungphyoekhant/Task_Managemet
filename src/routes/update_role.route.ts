import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { updateRoleController } from "../controllers/update_role.controller.js";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware.js";
export const router = express.Router();

router.post("/workspaces/:workspaceId/:userId/updateRole", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), updateRoleController.updateRole);
