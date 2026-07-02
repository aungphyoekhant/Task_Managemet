import { searchService } from "../services/search.service";
import { Request, Response } from "express";

export const searchController = {
  async searchProjects(req: Request, res: Response) {
    try {
      const workspaceId = Number(req.params.workspaceId);
      const q = (req.query.q as string) || "";
      const status = req.query.status as string;
      const { id: userId, role } = res.locals.user;

      const data = await searchService.searchProjects({ workspaceId, q, status, userId, role });
      res.status(200).json({ con: true, data });
    } catch (error: any) {
      res.status(500).json({ con: false, message: error.message });
    }
  },

  async searchTasks(req: Request, res: Response) {
    try {
      const workspaceId = Number(req.params.workspaceId);
      const q = (req.query.q as string) || "";
      const status = req.query.status as string;
      const { id: userId, role } = res.locals.user;

      const data = await searchService.searchTasks({ workspaceId, q, status, userId, role });
      res.status(200).json({ con: true, data });
    } catch (error: any) {
      res.status(500).json({ con: false, message: error.message });
    }
  },

  async searchUsers(req: Request, res: Response) {
    try {
      const workspaceId = Number(req.params.workspaceId);
      const q = (req.query.q as string) || "";

      const data = await searchService.searchUsers({ workspaceId, q });
      res.status(200).json({ con: true, data });
    } catch (error: any) {
      res.status(500).json({ con: false, message: error.message });
    }
  },

  async searchWorkspaces(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || "";
      const { id: userId } = res.locals.user;

      const data = await searchService.searchWorkspaces({ userId, q });
      res.status(200).json({ con: true, data });
    } catch (error: any) {
      res.status(500).json({ con: false, message: error.message });
    }
  },

  async globalSearch(req: Request, res: Response) {
    try {
      const workspaceId = Number(req.params.workspaceId);
      const q = (req.query.q as string) || "";
      const { id: userId, role } = res.locals.user;

      const data = await searchService.globalSearch({ workspaceId, q, userId, role });
      res.status(200).json({ con: true, data });
    } catch (error: any) {
      res.status(500).json({ con: false, message: error.message });
    }
  },
};
