import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { updateRoleController } from "../controllers/update_role.controller"; 
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";
import { taskUserController } from "../controllers/task_user.controller";

export const router = express.Router();

router.get(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/taskUsers", 
  auth, 
  checkWorkspaceRole(["OWNER", "ADMIN", "MEMBER"]), 
  taskUserController.getAssignees
);

router.post(
  "/tasks/:taskId/taskUsers", 
  auth, 
  checkWorkspaceRole(["OWNER", "ADMIN"]), 
  taskUserController.assignUser
);

router.delete(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/users/:userId",
  auth,
  checkWorkspaceRole(["OWNER", "ADMIN"]),
  taskUserController.removeUser
);