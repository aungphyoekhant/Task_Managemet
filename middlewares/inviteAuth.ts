import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
export const checkInvitePermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId, role } = req.body;
    const targetRole = role?.toUpperCase();
    const user = res.locals.user;

    if (!workspaceId) return res.status(400).json({ con: false, msg: "Workspace ID is required" });

    // Workspace နှင့် Member ကို တစ်ခါတည်း ရှာခြင်း (Query လျှော့ချရန်)
    const [member, workspace] = await Promise.all([
      prisma.workspaceUser.findFirst({
        where: { workspaceId: Number(workspaceId), userId: user.id },
      }),
      prisma.workspace.findUnique({
        where: { id: Number(workspaceId) },
      }),
    ]);

    if (!workspace) return res.status(404).json({ con: false, msg: "Workspace not found" });

    const isOwner = workspace.ownerId === user.id;
    const isAdmin = member?.role === "ADMIN";

    // Permission Checking
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ con: false, msg: "Unauthorized: You don't have permission" });
    }

    // Role Checking
    if (isAdmin && (targetRole === "ADMIN" || targetRole === "OWNER")) {
      return res.status(403).json({
        con: false,
        msg: "Admin cannot invite another Admin or Owner",
      });
    }

    if (isOwner && targetRole === "OWNER") {
      return res.status(403).json({
        con: false,
        msg: "You cannot invite another owner",
      });
    }

    next();
  } catch (error) {
    console.error("Invite Permission Error:", error);
    return res.status(500).json({ con: false, msg: "Server Error" });
  }
};
