import { Request, Response } from "express";
import { authService } from "../services/authServices";
import { userService } from "../services/userServices";

import jwt from "jsonwebtoken";

export const userController = {
  userLogin: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ msg: "Email and Password are required" });
      }

      const user = await authService.findByEmail(email);
      if (!user) return res.status(401).json({ msg: "Invalid email or password" });

      const isPasswordValid = await authService.comparePassword(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ msg: "Invalid email or password" });

      const { accessToken, refreshToken } = authService.generateTokens(user);
      await authService.updateRefreshToken(user.id, refreshToken);

      res.status(200).json({
        con: true,
        msg: "Login Successful",
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ msg: "Refresh token required" });

    try {
      const decoded = authService.verifyRefreshToken(refreshToken);
      const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });

      res.json({ accessToken: newAccessToken });
    } catch (err) {
      res.status(403).json({ msg: "Refresh token expired, please login again" });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      if (!user || !user.id) {
        return res.status(401).json({ con: false, msg: "Unauthorized" });
      }
      await userService.logout(user.id);

      return res.status(200).json({
        con: true,
        msg: "Logout Successful",
      });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Internal Server Error" });
    }
  },
};
