import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { updateRoleServices } from "../services/update_role.service";

export const updateRoleController = {
  updateRole: async (req: Request, res: Response) => {
    try {
      const { workspaceId, userId, newRole } = req.body;

      const workspace = await prisma.workspace.findUnique({
        where: { id: Number(workspaceId) },
      });

      if (workspace?.ownerId !== res.locals.user.id) {
        return res.status(403).json({ con: false, msg: "Access Denied: Only Owner can update roles" });
      }

      await updateRoleServices.updateRole(Number(workspaceId), Number(userId), newRole);

      return res.status(200).json({ con: true, msg: "Role updated successfully" });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Server Error" });
    }
  },
};
