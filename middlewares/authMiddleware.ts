import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("Token check failed for URL:", req.url);
    return res.status(401).json({ msg: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: number; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.locals.user = user;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired, please refresh" });
    }
    console.log(err);
    res.json("Middleware Error");
    return res.status(403).json({ msg: "User-Auth-Middleware : Invalid token" });
  }
};
