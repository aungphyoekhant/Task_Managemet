import { Request, Response, NextFunction } from "express";

export const roleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  if (!user) {
    return res.status(401).json({ msg: "User not found" });
  }
  if (user.role === "OWNER") {
    next();
  }
};
