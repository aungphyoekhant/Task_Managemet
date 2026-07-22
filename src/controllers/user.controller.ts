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
        return res.status(400).json({ con: false, msg: result.error.details[0].message });
      }

      const { email, password, name, token } = req.body;
      let userData;

      console.log(`+++++++++++++++++++++++++++++++ ${token}`)

      if (token) {
        userData = await userServices.inviteRegister({ email, password, name }, token);
        
        return res.status(201).json({ 
          con: true, 
          msg: "Joined workspace successfully", 
          data: userData 
        });
      } else {
        userData = await userServices.register({ email, password, name });
        
        return res.status(201).json({ 
          con: true, 
          msg: "Account created successfully", 
          data: userData 
        });
      }

    } catch (error: any) {
      console.error("Register Error:", error);
      return res.status(500).json({ 
        con: false, 
        msg: error.message || "Registration failed" 
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const result = loginValidator.validate(req.body);
      console.log(result);
      if (result.error) return res.status(400).json({ con: false, msg: result.error.details[0].message });

      const { email, password, token } = result.value;

      const { user, accessToken, refreshToken } = await userServices.login(email, password, token);

      return res.status(200).json({
        con: true,
        msg: "Login Successful",
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      return res.status(401).json({ con: false, msg: error.message });
    }
  },

  // LOGOUT
  logout: async (req: Request, res: Response) => {
    console.log("Logout");

    try {
      const userId = Number(res.locals.user.id);

      await userServices.logout(userId);

      return res.status(200).json({ con: true, msg: "Logged out successfully" });
    } catch (error: any) {
      return res.status(500).json({ con: false, msg: "Logout failed" });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      console.log(req.body)
      if (!refreshToken) return res.status(401).json({ con: false, msg: "Refresh token required" });

      const payload = authService.verifyRefreshToken(refreshToken);

      const newAccessToken = jwt.sign({ id: payload.id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });

      console.log("New Access Token :", newAccessToken)
      return res.status(200).json({ con: true, accessToken: newAccessToken });
    } catch (error: any) {
      return res.status(403).json({ con: false, msg: "Invalid or expired token" });
    }
  },

};
