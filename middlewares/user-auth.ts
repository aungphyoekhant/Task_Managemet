import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

// Request interface ကို extend လုပ်ထားတဲ့အတွက် error မတက်ပါဘူး
export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: true },
    });

    if (!user) {
      console.log("❌ Database ထဲမှာ ဒီ user ကို ရှာမတွေ့ဘူး");
      return res.status(404).json({ msg: "User not found" });
    }

    res.locals.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};
