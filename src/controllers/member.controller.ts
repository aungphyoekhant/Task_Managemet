import { Request, Response } from "express";
import { memberService } from "../services/member.service";
import { Role } from "../../generated/prisma/client";

export const memberController = {
  deleteMember: async (req: Request, res: Response) => {
    const { workspaceId, userId } = req.params;
    const currentUserId = Number(res.locals.user.id);

    const wId = Number(workspaceId);
    const uId = Number(userId);

    try {
      // ၁။ Target Member ရဲ့ Role ကို ရှာခြင်း
      const target = await memberService.getMemberRole(wId, uId);
      if (!target) return res.status(404).json({ msg: "Not Found Member" });

      // ၂။ Current User ရဲ့ Role နဲ့ Owner ဟုတ်မဟုတ် စစ်ဆေးခြင်း
      const currentUser = await memberService.getMemberRole(wId, currentUserId);
      const workspace = await memberService.getWorkspaceOwner(wId);

      const isOwner = workspace?.ownerId === currentUserId;
      const currentRole = currentUser?.role as Role;

      // Permission Check
      const hasPermission = memberService.canDelete(currentRole, isOwner, target.role);

      if (!hasPermission) {
        return res.status(403).json({ msg: "You don't have permission to delete this member" });
      }

      // Delete Member
      await memberService.deleteMember(wId, uId);

      return res.status(200).json({ msg: "Deleted Member Successfully" });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  },
};
