import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export const checkWorkspaceRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.user.id;

      if (!userId) {
        return res.status(400).json({ con: false, msg: "Missing user or workspace info" });
      }

      const workspaceId = Number(
        req.params?.workspaceId ||
        req.params?.id ||
        req.body?.workspaceId ||
        req.query?.workspaceId
      );

      if (!workspaceId) {
        
        return res.status(400).json({ con: false, msg: "Missing workspace info, workspace required" });
      }


      const member = await prisma.workspaceUser.findFirst({
        where: { userId, workspaceId },
        select: { role: true },
      });

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ con: false, msg: "Access denied: Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.log(error)
      return res.status(500).json({ con: false, msg: "Internal server error" });
    }
  };
};
