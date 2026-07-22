import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token required Aung Phyo Khnat " });
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: number; email: string };

    res.locals.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired, please refresh" });
    }
    return res.status(403).json({ msg: "User-Auth-Middleware : Invalid token" });
  }
};
