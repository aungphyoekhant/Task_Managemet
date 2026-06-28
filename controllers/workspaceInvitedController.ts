import { Request, Response } from "express";
import { prisma } from "../lib/prisma"; // DB စစ်ဆေးရန်
import { invitationService } from "../services/workspaceInvitedServices";

export const workspaceInvitedController = {
  inviteUser: async (req: Request, res: Response) => {
    try {
      const { workspaceId, email, role } = req.body;
      const user = res.locals.user;
      const targetRole = role?.toUpperCase();

      if (!workspaceId || !email || !role) {
        return res.status(400).json({ con: false, msg: "Missing required fields" });
      }

      // --- Permission Logic ကို Controller ထဲမှာတင် စစ်ခြင်း ---
      const [member, workspace] = await Promise.all([
        prisma.workspaceUser.findFirst({
          where: { workspaceId: Number(workspaceId), userId: user.id },
        }),
        prisma.workspace.findUnique({
          where: { id: Number(workspaceId) },
        }),
      ]);

      if (!workspace) return res.status(404).json({ con: false, msg: "Workspace not found" });

      const isOwner = workspace.ownerId === user.id;
      const isAdmin = member?.role === "ADMIN";

      // ၁။ Permission အခြေခံ စစ်ဆေးချက်
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ con: false, msg: "Unauthorized: You don't have permission" });
      }

      // ၂။ Admin အတွက် Role ကန့်သတ်ချက်
      if (isAdmin && (targetRole === "ADMIN" || targetRole === "OWNER")) {
        return res.status(403).json({ con: false, msg: "Admin cannot invite another Admin or Owner" });
      }

      // ၃။ Owner အတွက် Role ကန့်သတ်ချက်
      if (isOwner && targetRole === "OWNER") {
        return res.status(403).json({ con: false, msg: "You cannot invite another owner" });
      }

      // --- အကုန်မှန်ရင် Service ကို ခေါ်ယူခြင်း ---
      const result = await invitationService.inviteUser(user.id, Number(workspaceId), email, role);

      return res.status(201).json({
        con: true,
        msg: "Invitation sent successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("INVITE_ERROR:", error);
      return res.status(500).json({ con: false, msg: error.message || "Internal server error" });
    }
  },
};
