import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/role-Middleware";
import { workspaceController } from "../controllers/workspaceController";
export const router = express.Router();

router.get("/workspace/:id", auth, roleMiddleware, workspaceController.getWorkspace);

router.get("/workspaces", auth, roleMiddleware, workspaceController.getAllWorkspaces);

router.post("/workspace", auth, roleMiddleware, workspaceController.createWorkspace);

router.put("/workspace/:id", auth, roleMiddleware, workspaceController.modifyWorkspace);

router.delete("/workspace/:id", auth, roleMiddleware, workspaceController.dropWorkspace);
