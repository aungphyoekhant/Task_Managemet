import { Request, Response } from "express";
import { profileService } from "../services/profileServices";

export const profileController = {
  getProfile: async (req: Request, res: Response) => {
    const user = res.locals.user;

    try {
      const profile = await profileService.getProfile(user.id);

      if (!profile) {
        return res.status(404).json({ con: false, msg: "Profile user not found" });
      }

      res.json({
        con: true,
        msg: "Profile fetched successfully",
        data: profile,
      });
    } catch (error) {
      res.status(500).json({ con: false, msg: "Error fetching profile" });
    }
  },

  upsertProfile: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      const avatarUrl = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;

      const { name, workspaceId, jobTitle, bio, phone } = req.body;
      const parsedWorkspaceId = workspaceId ? Number(workspaceId) : undefined;

      // 2. Validation
      if (!name || !avatarUrl) {
        return res.status(400).json({ con: false, msg: "Name and Avatar are required" });
      }

      if (workspaceId && isNaN(parsedWorkspaceId as number)) {
        return res.status(400).json({ con: false, msg: "Valid workspaceId is required" });
      }

      const profile = await profileService.upsertProfile(user.id, {
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
      // 4. Error Handling
      if (error.message === "User is not a member of this workspace" || error.message === "User has no workspace") {
        return res.status(400).json({ con: false, msg: error.message });
      }

      console.error("Profile Error:", error);
      return res.status(500).json({ con: false, msg: "Error saving profile" });
    }
  },
};
