import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const checkProjectPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Full User Data in res.locals.user:", res.locals.user.id);
    const userId = res.locals.user?.id;
    const user = res.locals.user;

    console.log("User ID:", user.email);
    const workspaceId = Number(req.params.workspaceId || req.body.workspaceId);

    if (!userId) return res.status(401).json({ con: false, msg: "Unauthorized" });

    if (!workspaceId || isNaN(workspaceId)) return next();
    const member = await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
    });

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

    const isWorkspaceOwner = workspace?.ownerId === userId;

    const isAuthorized = member?.role === "ADMIN" || member?.role === "OWNER" || isWorkspaceOwner;

    if (!isAuthorized) {
      return res.status(403).json({ con: false, msg: "Access denied" });
    }

    return isAuthorized ? next() : res.status(403).json({ con: false, msg: "Access denied: Admin or Owner only" });
  } catch (error) {
    return res.status(500).json({ con: false, msg: "Server Error" });
  }
};
