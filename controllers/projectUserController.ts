import { Request, Response } from "express";
import { projectUserService } from "../services/projectUserServices";
import { prisma } from "../lib/prisma";

export const projectUserController = {
  addMember: async (req: Request, res: Response) => {
    try {
      const { projectId, userId } = req.body;
      const newMember = await projectUserService.addMember(Number(projectId), Number(userId));
      return res.status(201).json({ con: true, msg: "Member added successfully", data: newMember });
    } catch (error: any) {
      return res.status(400).json({ con: false, msg: error.message });
    }
  },

  getProjectMembers: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const members = await projectUserService.getMembersByProject(Number(projectId));
      return res.status(200).json({ con: true, msg: "Members retrieved successfully", data: members });
    } catch (error: any) {
      console.log("DEBUG ERROR:", error);
      return res.status(500).json({
        con: false,
        msg: "Server Error",
        details: error,
      });
    }
  },

  removeMember: async (req: Request, res: Response) => {
    try {
      const { projectUserId } = req.params;
      const requesterId = res.locals.user.id;
      const memberId = Number(projectUserId);

      if (!Number.isInteger(memberId)) {
        return res.status(400).json({ con: false, msg: "Invalid project member id" });
      }

      const member = await prisma.projectUser.findUnique({
        where: { id: memberId },
        include: { project: true },
      });

      if (!member) return res.status(404).json({ con: false, msg: "Member not found" });

      const requester = await prisma.projectUser.findFirst({
        where: { projectId: member.projectId, userId: requesterId },
      });

      const isOwner = member.project.createBy === requesterId;
      const isAdmin = requester?.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ con: false, msg: "Access Denied: Only Owner or Admin can delete members" });
      }

      await projectUserService.removeMember(memberId);

      return res.status(200).json({ con: true, msg: "Member removed successfully" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ con: false, msg: "Member not found" });
      }

      return res.status(500).json({ con: false, msg: error.message });
    }
  },
};
