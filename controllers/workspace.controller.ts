import { Request, Response } from "express";
import { workspaceService } from "../services/workspace.service";

export const workspaceController = {
  getAllWorkspace: async (req: Request, res: Response) => {
    const user = res.locals.user;

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

  createWorkspace: async (req: Request, res: Response) => {
    const { name } = req.body;

    const userId = Number(res.locals.user.id);

    const logo = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name) {
      return res.status(400).json({ msg: "Workspace name is required" });
    }

    if (!logo) return res.status(400).json({ msg: "Workspace logo is required" });

    try {
      const workspace = await workspaceService.createWorkspace(userId, name, logo);

      console.log("Workspace created:", workspace);

      res.status(201).json({
        con: true,
        msg: "Workspace created successfully",
        workspace,
      });
    } catch (error) {
      console.error("Create Workspace Error:", error);
      res.status(500).json({ msg: "Error creating workspace" });
    }
  },

  modifyWorkspace: async (req: Request, res: Response) => {
    const { name } = req.body;
    const user = res.locals.user;
    const workspaceId = Number(req.params.id);

    const newLogoPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!user) {
      return res.status(401).json({ con: false, msg: "User not found" });
    }

    if (!workspaceId) {
      return res.status(400).json({ con: false, msg: "Workspace id is required" });
    }

    if (!name) {
      return res.status(400).json({ con: false, msg: "Workspace name is required" });
    }

    try {
      const workspace = await workspaceService.modifyWorkspace(user.id, workspaceId, { name, logo: newLogoPath ?? "" });

      res.status(200).json({
        con: true,
        msg: "Workspace updated successfully",
        workspace,
      });
    } catch (error) {
      console.error("Modify Workspace Error:", error);
      res.status(500).json({ con: false, msg: "Error updating workspace" });
    }
  },

  dropWorkspace: async (req: Request, res: Response) => {
    const user = res.locals.user;
    const workspaceId = Number(req.params.id);

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    if (!workspaceId) {
      return res.status(400).json({ msg: "Workspace id is required" });
    }

    try {
      const workspace = await workspaceService.dropWorkspace(user.id, Number(workspaceId));
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
