import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/role-Middleware";
import { workspaceController } from "../controllers/workspace.controller";
import { upload } from "../middlewares/upload";
export const router = express.Router();

router.get("/workspace/:id", auth, workspaceController.getWorkspace);

router.get("/workspaces", auth, workspaceController.getAllWorkspace);

router.post("/workspace", auth, upload.single("logo"), roleMiddleware, workspaceController.createWorkspace);

router.put("/workspace/:id", auth, upload.single("logo"), roleMiddleware, workspaceController.modifyWorkspace);

router.delete("/workspace/:id", auth, workspaceController.dropWorkspace);
