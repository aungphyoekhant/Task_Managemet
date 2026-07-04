import { Request, Response } from "express";
import { workspaceService } from "../services/workspace.service";
import { deleteFile } from "../utils/fileHandler";
export const workspaceController = {
  getAllWorkspace: async (req: Request, res: Response) => {
    const user = res.locals.user;

    console.log(user);

    if (!user) {
      return res.status(401).json({ con: false, msg: "User not found" });
    }

    try {
      const workspaces = await workspaceService.getAllWorkspace(user.id);
      res.status(200).json({
        con: true,
        msg: "Workspaces fetched successfully",
        workspaces,
      });
    } catch (error) {
      console.error("Get All Workspaces Error:", error);
    }
  },

  getWorkspace: async (req: Request, res: Response) => {
    const user = res.locals.user;
    const workspaceId = Number(req.params.id);

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    if (!workspaceId) {
      return res.status(400).json({ msg: "Workspace id is required" });
    }

    try {
      const workspace = await workspaceService.getWorkspace(user.id, workspaceId);
      res.status(200).json({
        con: true,
        msg: "Workspace fetched successfully",
        workspace,
      });
    } catch (error) {
      console.error("Get Workspace Error:", error);
      res.status(500).json({ msg: "Error fetching workspace" });
    }
  },

  getAllWrokspaceByUserId: async (req: Request, res: Response) => {
    try {
      // Auth middleware ကနေတစ်ဆင့် ရလာတဲ့ userId ကို သုံးခြင်း
      const userId = Number(res.locals.user.id);

      if (!userId) {
        return res.status(401).json({ con: false, msg: "Unauthorized" });
      }

      const workspaces = await workspaceService.getAllWorkspaceByUserId(userId);

      return res.status(200).json({
        con: true,
        msg: "Workspaces fetched successfully",
        data: workspaces,
      });
    } catch (error: any) {
      console.error("Fetch Workspaces Error:", error);
      return res.status(500).json({ con: false, msg: "Internal Server Error" });
    }
  },

  createWorkspace: async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = Number(res.locals.user.id);
    const file = req.file;

    if (!name) {
      if (file) deleteFile(file.path);
      return res.status(400).json({ msg: "Workspace name is required" });
    }

    if (!file) {
      return res.status(400).json({ msg: "Workspace logo is required" });
    }

    try {
      const logo = `/uploads/${file.filename}`;
      const workspace = await workspaceService.createWorkspace(userId, name, logo);

      res.status(201).json({
        con: true,
        msg: "Workspace created successfully",
        workspace,
      });
    } catch (error) {
      console.error("Create Workspace Error:", error);

      if (file) {
        deleteFile(file.path);
      }

      res.status(500).json({ msg: "Error creating workspace" });
    }
  },

  modifyWorkspace: async (req: Request, res: Response) => {
    const { name } = req.body;
    const user = res.locals.user;
    const workspaceId = Number(req.params.id);
    const file = req.file;

    if (!user) return res.status(401).json({ con: false, msg: "User not found" });
    if (!workspaceId) return res.status(400).json({ con: false, msg: "Workspace id is required" });
    if (!name) return res.status(400).json({ con: false, msg: "Workspace name is required" });

    try {
      const existingWorkspace = await workspaceService.getWorkspace(user.id, workspaceId);
      if (!existingWorkspace) {
        if (file) deleteFile(file.path);
        return res.status(404).json({ con: false, msg: "Workspace not found" });
      }

      const updateData: any = { name };
      if (file) {
        updateData.logo = `/uploads/${file.filename}`;
      }

      const workspace = await workspaceService.modifyWorkspace(user.id, workspaceId, updateData);

      if (file && existingWorkspace.logo) {
        deleteFile(existingWorkspace.logo);
      }

      res.status(200).json({
        con: true,
        msg: "Workspace updated successfully",
        workspace,
      });
    } catch (error) {
      console.error("Modify Workspace Error:", error);

      if (file) {
        deleteFile(file.path);
      }

      res.status(500).json({ con: false, msg: "Error updating workspace" });
    }
  },

  dropWorkspace: async (req: Request, res: Response) => {
    const user = res.locals.user;
    const workspaceId = Number(req.params.id);

    if (!user) return res.status(401).json({ msg: "User not found" });
    if (!workspaceId) return res.status(400).json({ msg: "Workspace id is required" });

    try {
      const workspace = await workspaceService.getWorkspace(user.id, workspaceId);

      if (!workspace) {
        return res.status(404).json({ msg: "Workspace not found" });
      }

      await workspaceService.dropWorkspace(user.id, workspaceId);

      if (workspace.logo) {
        deleteFile(workspace.logo);
      }

      res.status(200).json({
        con: true,
        msg: "Workspace deleted successfully",
      });
    } catch (error) {
      console.error("Drop Workspace Error:", error);
      res.status(500).json({ msg: "Error deleting workspace" });
    }
  },
};
