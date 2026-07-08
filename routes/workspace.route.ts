import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { workspaceController } from "../controllers/workspace.controller";
import { upload } from "../middlewares/upload";
export const router = express.Router();
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

router.get("/allworkspacebyuserid", auth, workspaceController.getAllWorkspaceByUserId);

router.get("/workspace/:id", auth, checkWorkspaceRole(["OWNER"]), workspaceController.getWorkspace);

router.get("/allworkspaces", auth, checkWorkspaceRole(["OWNER"]), workspaceController.getAllWorkspace);

router.post("/workspace", auth, checkWorkspaceRole(["OWNER"]), upload.single("logo"), workspaceController.createWorkspace);

router.put("/workspace/:id", auth, checkWorkspaceRole(["OWNER"]), upload.single("logo"), workspaceController.modifyWorkspace);

router.delete("/workspace/:id", auth, checkWorkspaceRole(["OWNER"]), workspaceController.dropWorkspace);
