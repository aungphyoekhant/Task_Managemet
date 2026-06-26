import { Request, Response } from "express";
import { memberService } from "../services/memberServices";

export const memberController = {
  deleteMember: async (req: Request, res: Response) => {
    const { workspaceId, userId } = req.params;
    const currentUserId = Number(res.locals.user.id);

    try {
      // Find target member
      const targetMember = await memberService.getMemberRole(Number(workspaceId), Number(userId));
      if (!targetMember) {
        return res.status(404).json({ message: "Member မတွေ့ရှိပါ။" });
      }

      //Find current user
      const currentUser = await memberService.getMemberRole(Number(workspaceId), Number(currentUserId));
      const workspace = await memberService.getWorkspaceOwner(Number(workspaceId));

      const isOwner = workspace?.ownerId === currentUserId;
      const isAdmin = currentUser?.role === "ADMIN";

      // Check permission
      let canDelete = false;

      if (isOwner) {
        canDelete = true;
      } else if (isAdmin && targetMember.role !== "ADMIN" && targetMember.role !== "OWNER") {
        canDelete = true;
      }

      if (!canDelete) {
        return res.status(403).json({ message: "You don't have permission to delete this member" });
      }

      // ၄။ ဖျက်ခြင်း
      await memberService.deleteMember(Number(workspaceId), Number(userId));

      return res.status(200).json({ message: "Member deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  },
};
