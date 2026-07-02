import { Request, Response } from "express";
import { userServices } from "../services/user.service";
import { authService } from "../services/auth.service";
import jwt from "jsonwebtoken";
import { loginValidator, registerValidator } from "../validators/userauth";

export const userController = {
  register: async (req: Request, res: Response) => {
    try {
      const result = registerValidator.validate(req.body);
      if (result.error) {
        return res.json(`Validation Error: ${result.error.details[0].message}`);
      }

      const { email, password, name, invitationId } = req.body;

      const newUser = await userServices.register({ email, password, name }, invitationId ? Number(invitationId) : undefined);

      return res.status(201).json({ con: true, msg: "Account Created", data: newUser });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: error });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const result = loginValidator.validate(req.body);
      if (result.error) {
        return res.json(`Validation Error: ${result.error.details[0].message}`);
      }

      const { email, password, invitationId } = result.value;

      const data = await userServices.login(email, password, invitationId ? Number(invitationId) : undefined);

      if (!data) {
        return res.status(401).json({ con: false, msg: "Invalid email or password" });
      }

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
