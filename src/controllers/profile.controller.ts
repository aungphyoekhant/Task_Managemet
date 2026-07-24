import { Request, Response } from "express";
import { profileService } from "../services/profile.service.js";
import { deleteFile } from "../utils/fileHandler.js";
import { upsertProfileValidator } from "../validators/profileauth.js";

export const profileController = {
  getProfile: async (req: Request, res: Response) => {
    const user = res.locals.user;

    if (!user || !user.id) {
      return res.status(401).json({ con: false, msg: "Unauthorized: No user ID found" });
    }

    try {
      const userId = Number(user.id);

      const profile = await profileService.getProfile(userId);

      if (!profile) {
        return res.status(404).json({ con: false, msg: "Profile not found" });
      }

      return res.json({
        con: true,
        msg: "Profile fetched successfully",
        data: profile,
      });
    } catch (error: any) {
      console.error("Get Profile Error:", error);
      return res.status(500).json({ con: false, msg: "Error fetching profile", error: error.message });
    }
  },

  upsertProfile: async (req: Request, res: Response) => {
    try {
      const userId = Number(res.locals.user.id);
      console.log(res.locals.user)
      const body = req.body || {};

      const existingData = await profileService.getProfile(userId);

      const avatarUrl = req.file ? `/uploads/${req.file.filename}` : body.avatar === "" ? "" : undefined;
      const { name,  jobTitle, bio, phone } = body;

      const {error , value} = upsertProfileValidator.validate({
        name : name,
        phone : phone,
        ...(avatarUrl !== undefined && { avatar: avatarUrl }),
        jobTitle : jobTitle,
        bio : bio,
        userId: userId,
      })

      if (error) {
        if (req.file) deleteFile(req.file.path);
        return res.status(400).json({ con: false, msg: error.details[0].message });
      }

      const updateData: any = { name, jobTitle, bio, phone, userId };
      if (value.avatar !== undefined) {
        updateData.avatar = value.avatar;
      }

      const profile = await profileService.upsertProfile(userId, updateData);

      // Delete old avatar if a new one was uploaded OR explicitly removed
      if (value.avatar !== undefined && existingData?.profile?.avatar && existingData.profile.avatar !== value.avatar) {
        deleteFile(existingData.profile.avatar);
      }

      return res.json({
        con: true,
        msg: "Profile saved successfully",
        data: profile,
      });
    } catch (error: any) {
      console.error("Profile Error:", error);
      return res.status(500).json({ con: false, msg: "Error saving profile" });
    }
  },
};
