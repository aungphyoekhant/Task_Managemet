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
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: number; role: string; email: string };

    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId: decoded.id },
      orderBy: { id: "asc" },
    });

    res.locals.user = {
      id: decoded.id,
      email: decoded.email,
      role: workspaceUser?.role,
    };

    console.log(res.locals.user);

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired, please refresh" });
    }
    return res.status(403).json({ msg: "User-Auth-Middleware : Invalid token" });
  }
};
