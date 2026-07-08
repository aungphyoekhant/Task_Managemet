import { Request, Response } from "express";
import { projectUserService } from "../services/project_user.service";
import { prisma } from "../lib/prisma";
import { authService } from "../services/auth.service";
import { addProjectMemberValidator, removeMemberValidator } from "../validators/projectuser-auth";

export const projectUserController = {
  addMember: async (req: Request, res: Response) => {
    try {
      const {error, value } = addProjectMemberValidator.validate(req.body)

      if(error){
        return res.status(400).json({con : false, msg : error.details[0].message})
      }


      const userId = Number(res.locals.user.id);
      if (!userId) {
        return res.status(401).json({ con: false, msg: "Unauthorized: No user ID found" });
      }

      const { projectId, assignedTo, workspaceId } = req.body;


      const data = await authService.getWorkspaceUserRole({ userId,workspaceId : Number(workspaceId)});

      if (data?.role !== "OWNER" && data?.role !== "ADMIN") {
        return res.status(403).json({ con: false, msg: "Access denied: Only Owners and Admins can add members" });
      }

      const newMember = await projectUserService.addMember(
        Number(projectId),
        Number(workspaceId),
        Number(assignedTo),
        userId);

      return res.status(201).json({ con: true, msg: "Member added successfully", data: newMember });

      
    } catch (error: any) {
      console.error("Add Member Error:", error);
      return res.status(400).json({ con: false, msg: error.message || "Failed to add member" });
    }
  },

  getAllProjectMembers: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      const members = await projectUserService.getMembersByProject(Number(projectId));

      if (!members) return res.status(404).json({ con: false, msg: "Members not found" });

      return res.status(200).json({ con: true, msg: "Members retrieved successfully", data: members });
    } catch (error: any) {
      return res.status(500).json({
        con: false,
        msg: "Server Error",
        details: error,
      });
    }
  },

  removeMember: async (req: Request, res: Response) => {
    try {

      const {error, value} = removeMemberValidator.validate(req.params)

      if(error) {
        return res.status(400).json({con : false, msg : error.details[0].message})
      }

      const { projectUserId } = req.params;
      const requesterId = res.locals.user.id;

      const member = await projectUserService.getProjectMemberById(Number(projectUserId));


      if (!member) return res.status(404).json({ con: false, msg: "Member not found" });

     const requester = await projectUserService.getProjectUserByUserId(member.projectId, requesterId);

      const isOwner = member.project.createBy === requesterId;
      const isAdmin = requester?.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ con: false, msg: "Access Denied: Only Owner or Admin can delete members" });
      }

      await projectUserService.removeMember(Number(projectUserId));

      return res.status(200).json({ con: true, msg: "Member removed successfully" });


    } catch (error: any) {
      console.log("Project User Controller : ", error)
      return res.status(500).json({ con: false, msg: error.message });
    }
  },
};
