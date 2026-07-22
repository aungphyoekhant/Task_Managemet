import { Request, Response } from "express";
import { workspaceService } from "../services/workspace.service";
import { deleteFile } from "../utils/fileHandler";
import { createWorkspaceValidator, dropWorkspaceValidator, getWorkspaceValidator, modifyWorkspaceValidator } from "../validators/workspaceauth";
export const workspaceController = {
  getAllWorkspace: async (req: Request, res: Response) => {

    console.log(res.locals.user)

    const userId = Number(res.locals.user.id);


    if (!userId || isNaN(userId)) {
      return res.status(401).json({ con: false, msg: "User not found" });
    }

    try {
      const workspaces = await workspaceService.getAllWorkspace(userId);
      return res.status(200).json({
        con: true,
        msg: "Workspaces fetched successfully",
        result: workspaces
      });


    } catch (error) {
      console.log("Get All Workspaces Error:", error);
      return res.status(500).json({ con: false, msg: error });
    }
  },

  getWorkspace: async (req: Request, res: Response) => {

    const userId = Number(res.locals.user.id);
    const workspaceId = Number(req.params.id);

    const { error, value } = getWorkspaceValidator.validate({
      userId,
      workspaceId
    })

    console.log(value)
    if (error) {
      return res.status(400).json({ con: false, msg: error.details[0].message })
    }


    try {
      const workspace = await workspaceService.getWorkspace(userId, workspaceId);
      res.status(200).json({
        con: true,
        msg: "Workspace fetched successfully",
        workspace,
      });

      console.log(workspace)
    } catch (error) {
      console.error("Get Workspace Error:", error);
      res.status(500).json({ msg: "Error fetching workspace" });
    }
  },

  getAllWorkspaceByUserId: async (req: Request, res: Response) => {
    try {

      const userId = Number(res.locals.user.id);

      if (!userId) {
        return res.status(401).json({ con: false, msg: "Unauthorized" });
      }

      const workspaces = await workspaceService.getAllWorkspaceByUserId(userId);

      return res.status(200).json({
        con: true,
        msg: "Workspaces All fetched successfully",
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
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const { error, value } = createWorkspaceValidator.validate({
      name,
      logo: logoUrl,
      userId,
    });

    if (error) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({ con: false, msg: error.details[0].message });
    }

    try {
      const workspace = await workspaceService.createWorkspace(
        value.userId,
        value.name,
        value.logo,
      );

      res.status(201).json({
        con: true,
        msg: "Workspace created successfully",
        result: workspace,
      });
    } catch (error) {
      console.error("Create Workspace Error:", error);
      res.status(500).json({ msg: "Error creating workspace" });
    }
  },

  modifyWorkspace: async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = Number(res.locals.user.id);
    const workspaceId = Number(req.params.id);
    const file = req.file;
    const logoUrl = file ? `/uploads/${file.filename}` : req.body.logo === "" ? "" : undefined;

    const { error, value } = modifyWorkspaceValidator.validate({
      name: name,
      workspaceId: workspaceId,
      userId: userId,
      ...(logoUrl !== undefined && { logo: logoUrl })
    });
    console.log(value)

    if (error) {
      if (file) deleteFile(file.path);
      return res.status(400).json({ con: false, msg: error.details[0].message });
    }

    try {
      // 2. Fetch existing workspace to handle old file deletion
      const existingWorkspace = await workspaceService.getWorkspace(userId, workspaceId);

      if (!existingWorkspace) {
        if (file) deleteFile(file.path);
        return res.status(404).json({ con: false, msg: "Workspace not found" });
      }

      // 3. Prepare update data
      const updateData: any = { name: value.name };
      if (value.logo !== undefined) {
        updateData.logo = value.logo;
      }

      //  Update in Database (Use userId, not user.id)
      const workspace = await workspaceService.modifyWorkspace(userId, workspaceId, updateData);

      //  Delete old logo if a new one was uploaded OR if logo is explicitly removed
      if (value.logo !== undefined && existingWorkspace.logo && existingWorkspace.logo !== value.logo) {
        deleteFile(existingWorkspace.logo);
      }

      res.status(200).json({
        con: true,
        msg: "Workspace updated successfully",
        result: workspace,
      });
    } catch (error) {
      console.error("Modify Workspace Error:", error);
      if (file) deleteFile(file.path);
      res.status(500).json({ con: false, msg: "Error updating workspace" });
    }
  },

  dropWorkspace: async (req: Request, res: Response) => {
    const userId = Number(res.locals.user.id)
    const workspaceId = Number(req.params.id);

    const { error, value } = dropWorkspaceValidator.validate({
      userId: userId,
      workspaceId: workspaceId
    })

    if (error) {
      return res.status(400).json({ con: false, msg: error.details[0].message })
    }


    try {

      const workspace = await workspaceService.getWorkspace(userId, workspaceId);

      if (!workspace) {
        return res.status(404).json({ msg: "Workspace not found" });
      }

      await workspaceService.dropWorkspace(userId, workspaceId);

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
