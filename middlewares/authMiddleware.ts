import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: number; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        profile: true,
        workspaceUsers: {
          include: {
            workspace: true,
          },
        },
        projectUsers: true,
        projects: true,
        notifications: true,
        activityLogs: true,
        invitations: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // res.locals.user += user
    res.locals.user = user;
    next();
  } catch (err: any) {
    // Token Expired => Error
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired, please refresh" });
    }

    console.log(err);
    res.json(err);
    return res.status(403).json({ msg: "User-Auth-Middleware : Invalid token" });
  }
};
