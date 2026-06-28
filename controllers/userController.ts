import { Request, Response } from "express";
import { userServices } from "../services/userServices";
import { authService } from "../services/authServices";
import jwt from "jsonwebtoken";

export const userController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, confirmPassword, name, invitationId } = req.body;

      if (password !== confirmPassword) return res.status(400).json({ con: false, msg: "Passwords do not match" });

      const newUser = await userServices.register({ email, password, name }, invitationId ? Number(invitationId) : undefined);
      return res.status(201).json({ con: true, msg: "Account Created", data: newUser });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password, invitationId } = req.body;
      const data = await userServices.login(email, password, invitationId ? Number(invitationId) : undefined);
      return res.status(200).json({ con: true, msg: "Login Successful", data });
    } catch (error: any) {
      return res.status(401).json({ con: false, msg: error.message });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      if (!user) return res.status(401).json({ con: false, msg: "Unauthorized" });
      await userServices.logout(user.id);
      return res.status(200).json({ con: true, msg: "Logout successful" });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error.message });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(401).json({ con: false, msg: "Refresh token required" });
      const payload = authService.verifyRefreshToken(refreshToken);
      const newAccessToken = jwt.sign({ id: payload.id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });
      return res.status(200).json({ con: true, accessToken: newAccessToken });
    } catch (error: any) {
      return res.status(403).json({ con: false, msg: "Invalid or expired token" });
    }
  },
};
