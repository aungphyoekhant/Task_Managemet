import { Request, Response } from "express";
import { profileService } from "../services/profile.service";
import { deleteFile } from "../utils/fileHandler";

export const profileController = {
  getProfile: async (req: Request, res: Response) => {
    console.log(res.locals.user);
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
      const body = req.body || {};

      const existingData = await profileService.getProfile(userId);

      if (req.file && existingData?.profile?.avatar) {
        deleteFile(existingData.profile.avatar);
      }

      const avatarUrl = req.file ? `/uploads/${req.file.filename}` : body.avatar;
      const { name, workspaceId, jobTitle, bio, phone } = body;

      if (!name) {
        return res.status(400).json({ con: false, msg: "Name is required" });
      }

      const parsedWorkspaceId = workspaceId ? Number(workspaceId) : existingData?.workspaceUsers?.[0]?.workspaceId;

      const profile = await profileService.upsertProfile(userId, {
        name,
        avatar: avatarUrl,
        jobTitle,
        bio,
        phone,
        workspaceId: parsedWorkspaceId,
      });

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
