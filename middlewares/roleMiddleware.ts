import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma"; // သင့် prisma instance

export const checkWorkspaceRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.user.id;
      console.log(userId);

      if (!userId) {
        return res.status(400).json({ con: false, msg: "Missing user or workspace info" });
      }

      const member = await prisma.workspaceUser.findFirst({
        where: { userId },
        select: { role: true },
      });

      console.log(member);

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ con: false, msg: "Access denied: Insufficient permissions" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Internal server error" });
    }
  };
};
