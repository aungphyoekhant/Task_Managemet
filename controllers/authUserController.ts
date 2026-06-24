import { Request, Response } from "express";
import { authUserServices } from "../services/authUserServices";

export const authUserController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, name, invitationId } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ con: false, msg: "Email, Password, and Name are required" });
      }

      // invitationId ကို number အဖြစ်ပြောင်းပြီး Service သို့ ပို့ပါ
      const invId = invitationId ? Number(invitationId) : undefined;
      const newUser = await authUserServices.register(req.body, invId);

      return res.status(201).json({
        con: true,
        msg: "Member Account Successfully Created",
        data: newUser,
      });
    } catch (error: any) {
      console.error("Register Error:", error);
      return res.status(500).json({ con: false, msg: error.message || "Internal Server Error" });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      // invitationId ကိုပါ ထည့်သွင်းလက်ခံပါ
      const { email, password, invitationId } = req.body;

      // Service သို့ invitationId ကို ပို့ပါ (Login ဝင်ပြီးတာနဲ့ Workspace ထဲ အလိုလိုဝင်စေရန်)
      const invId = invitationId ? Number(invitationId) : undefined;
      const data = await authUserServices.login(email, password, invId);

      return res.status(200).json({
        con: true,
        msg: "Login Successful",
        data: data,
      });
    } catch (error: any) {
      console.error("Login Error:", error.message);
      return res.status(401).json({ con: false, msg: error.message });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      if (!user) {
        return res.status(401).json({ con: false, msg: "Unauthorized user" });
      }

      await authUserServices.logout(user.id);

      return res.status(200).json({
        con: true,
        msg: "Logout successful and account deleted permanently.",
      });
    } catch (error: any) {
      console.error("Logout Error:", error.message);
      return res.status(500).json({ con: false, msg: "Failed to delete account" });
    }
  },
};
