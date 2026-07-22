import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { updateRoleController } from "../controllers/update_role.controller";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";
export const router = express.Router();

router.post("/workspaces/:workspaceId/:userId/updateRole", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), updateRoleController.updateRole);
