import { Request, Response } from "express";
import { profileService } from "../services/profileServices";

export const profileController = {
  getProfile: async (req: Request, res: Response) => {
    const user = res.locals.user;

    if (!user || !user.id) {
      return res.status(401).json({ msg: "Unauthorized: No user found" });
    }

    try {
      const profile = await profileService.getProfile(Number(user.id));

      res.json({
        email: user.email,
        name: profile?.name || "No name set",
        avatar: profile?.avatar || "No avatar set",
      });
    } catch (error: any) {
      console.error("Get Profile Error:", error);
      res.status(500).json({
        msg: "Error fetching profile",
        error: error.message,
      });
    }
  },

  createProfile: async (req: Request, res: Response) => {
    const { name, avatar } = req.body;
    const user = res.locals.user;

    if (!name || !avatar) {
      return res.status(400).json({ msg: "Name and Avatar are required" });
    }

    try {
      const profile = await profileService.upsertProfile(user.id, { name, avatar });

      res.json({
        con: true,
        msg: "Saved Successfully Profile",
        result: {
          ...profile,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error("Profile Save Error:", error);
      res.status(500).json({ msg: "Error saving profile" });
    }
  },
};
