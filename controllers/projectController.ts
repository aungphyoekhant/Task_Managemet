import { projectService } from "../services/projectServices";
import { Request, Response } from "express";

export const projectController = {
  createProject: async (req: Request, res: Response) => {
    try {
      const workspaceId = Number(req.params.workspaceId);
      const user = res.locals.user;

      console.log(workspaceId);

      if (!workspaceId || isNaN(workspaceId)) {
        return res.status(400).json({ con: false, msg: "Valid Workspace ID is required" });
      }

      const { projectName, description, startDate, endDate } = req.body;

      console.log(req.body);

      if (!projectName || !description || !startDate || !endDate) {
        return res.status(400).json({ con: false, msg: "Missing required fields" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Date Format မှန်မမှန် စစ်ပါ
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ con: false, msg: "Invalid date format" });
      }

      if (start >= end) {
        return res.status(400).json({ con: false, msg: "Start date must be before end date" });
      }

      const project = await projectService.createProject({
        projectName,
        description,
        startDate: start,
        endDate: end,
        workspaceId,
        createBy: user.id,
      });

      return res.status(201).json({
        con: true,
        msg: "Project created successfully",
        data: project,
      });
    } catch (error) {
      console.error("Create Project Error:", error);
      return res.status(500).json({ con: false, msg: "Internal Server Error" });
    }
  },
};
