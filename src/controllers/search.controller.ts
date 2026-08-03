import { Request, Response } from "express";
import { searchService } from "../services/search.service.js";
import { prisma } from "../lib/prisma.js";

export const searchController = {
  // Project Search
  searchProject: async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { q } = req.query;
    
    // Permission Check
    const isMember = await prisma.workspaceUser.findFirst({ 
        where: { workspaceId: Number(workspaceId), userId: Number(res.locals.user.id) } 
    });


    if (!isMember) return res.status(403).json({ con: false, msg: "Access Denied" });

    const data = await searchService.searchProjects(Number(workspaceId), q as string);
    res.json({ con: true, data });
  },

  searchTasksByTitle: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { workspaceId, q } = req.query;
      const userId = Number(res.locals.user.id);

      const data = await searchService.searchTasksByTitle(
        Number(workspaceId), Number(projectId), userId, (q as string) || ""
      );
      return res.json({ con: true, data });
    } catch (error: any) {
      return res.status(error.message === "UNAUTHORIZED_ACCESS" ? 403 : 500).json({ con: false, msg: error.message });
    }
  },

  searchTasksByStatus: async (req: Request, res: Response) => {
    try {
      
      const { workspaceId } = req.params;
      const { projectId, status } = req.query;
      const userId = Number(res.locals.user.id);

      const data = await searchService.searchTasksByStatus(
        Number(workspaceId), Number(projectId), userId, status as any
      );
      
      return res.json({ con: true, data });
      
    } catch (error: any) {
      return res.status(error.message === "UNAUTHORIZED_ACCESS" ? 403 : 500).json({ con: false, msg: error.message });
    }
  },

  searchUsers: async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.params;

      const userId = Number(res.locals.user.id);
      
      const q = req.query.q as string || ""; 
      
      const users = await searchService.searchUsers(
        Number(workspaceId), 
        userId,
        q,
      );

      return res.json({ con: true, data: users });
    } catch (error: any) {
      const status = error.message === "UNAUTHORIZED_ACCESS" ? 403 : 500;
      return res.status(status).json({ con: false, msg: error.message });
    }
  },
  
  searchWorkspaces: async (req: Request, res: Response) => {
    try {

      const { q } = req.query;

      const userId = Number(res.locals.user.id);

      const workspaces = await searchService.searchWorkspaces(
        userId,
        (q as string) || ""
      );

      return res.json({ con: true, data: workspaces });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  searchProjectUsers: async (req: Request, res: Response) => {
  try {
    const { workspaceId, projectId } = req.params;
    const { q } = req.query;

    // 1. Number parse လုပ်ပြီး NaN မဖြစ်အောင် default 0 (or Check) ထားပေးပါ
    const parsedWorkspaceId = Number(workspaceId) || 0;
    const parsedProjectId = Number(projectId) || 0;
    const searchString = typeof q === "string" ? q.trim() : "";

    // 2. Service ထို့ဆီ parameter 3 ခုပဲ ပို့ပေးပါ (userId မလိုပါ)
    const users = await searchService.searchProjectUsers(
      parsedWorkspaceId,
      parsedProjectId,
      searchString
    );

    return res.json({ con: true, data: users });
  } catch (error: any) {
    console.error("Search Project Users Error:", error);
    return res.status(500).json({ con: false, msg: error.message || "Failed to search project users" });
  }
},

}