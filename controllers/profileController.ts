import { Request, Response } from "express";
import { profileService } from "../services/profileServices";

export const profileController = {
  getProfile: async (req: Request, res: Response) => {
    const user = res.locals.user;

    try {
      const profile = await profileService.getProfile(user.id);
      console.log("Profile:", profile);

      res.json({
        con: true,
        data: {
          email: user.email,
          role: user.role,
          name: profile?.name || "No name set",
          avatar: profile?.avatar || "No avatar set",
        },
      });
    } catch (error) {
      res.status(500).json({ con: false, msg: "Error fetching profile" });
    }
  },

  upsertProfile: async (req: Request, res: Response) => {
    const { name, avatar } = req.body;
    const user = res.locals.user;

    if (!name || !avatar) {
      return res.status(400).json({ con: false, msg: "Name and Avatar are required" });
    }

    try {
      const profile = await profileService.upsertProfile(user.id, { name, avatar });

      res.json({
        con: true,
        msg: "Profile saved successfully",
        data: profile,
      });
    } catch (error) {
      res.status(500).json({ con: false, msg: "Error saving profile" });
    }
  },
};
