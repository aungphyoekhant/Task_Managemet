import express from "express";
import { userAuth } from "../middlewares/user-auth";
import { roleMiddleware } from "../middlewares/role-Middleware";
import { workspaceController } from "../controllers/workspaceController";
export const router = express.Router();

router.get("/workspace/:id", userAuth, roleMiddleware, workspaceController.getWorkspace);

router.get("/workspaces", userAuth, roleMiddleware, workspaceController.getAllWorkspaces);

router.post("/workspace", userAuth, roleMiddleware, workspaceController.createWorkspace);

router.put("/workspace/:id", userAuth, roleMiddleware, workspaceController.modifyWorkspace);

router.delete("/workspace/:id", userAuth, roleMiddleware, workspaceController.dropWorkspace);
