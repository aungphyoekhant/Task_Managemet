import { Request, Response } from "express";
import { commentService } from "../services/comment.service";

export const commentController = {
  addComment: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const { content } = req.body;
      const { id: authorId } = res.locals.user;

      console.log(content, authorId, taskId);

      if (isNaN(taskId)) {
        return res.status(400).json({ con: false, msg: "Invalid taskId" });
      }

      if (!authorId) {
        return res.status(401).json({ con: false, msg: "Unauthorized" });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ con: false, msg: "Content is required" });
      }

      if (content.trim().length > 1000) {
        return res.status(400).json({ con: false, msg: "Content too long" });
      }

      const newComment = await commentService.createComment({
        taskId,
        authorId,
        content,
      });

      return res.status(201).json({ con: true, msg: "Comment added", data: newComment });
    } catch (error: any) {
      if (error.message === "Task not found") {
        return res.status(404).json({ con: false, msg: "Task not found" });
      }
      return res.status(500).json({ con: false, msg: error.message || "Error adding comment" });
    }
  },

  getComments: async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const comments = await commentService.getCommentsByTaskId(taskId);

      return res.status(200).json({ con: true, data: comments });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error fetching comments" });
    }
  },

  updateComment: async (req: Request, res: Response) => {
    try {
      const commentId = Number(req.params.commentId);
      const { content } = req.body;
      const { id: authorId } = res.locals.user;

      if (!commentId) {
        return res.status(400).json({ con: false, msg: "Invalid commentId" });
      }

      if (!content) {
        return res.status(400).json({ con: false, msg: "Content is required" });
      }

      const result = await commentService.updateComment(Number(commentId), authorId, content);

      if (!result) {
        return res.status(404).json({ con: false, msg: "Comment not found" });
      }

      return res.status(200).json({ con: true, msg: "Comment updated successfully" });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error updating comment" });
    }
  },

  deleteComment: async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const { id: authorId } = res.locals.user;

      if (commentId === undefined || authorId === undefined) {
        return res.status(400).json({ con: false, msg: "Invalid commentId or authorId" });
      }

      const result = await commentService.deleteComment(Number(commentId), authorId);

      if (!result) {
        return res.status(404).json({ con: false, msg: "Comment not found" });
      }

      return res.status(200).json({ con: true, msg: "Comment deleted successfully" });
    } catch (error) {
      return res.status(500).json({ con: false, msg: "Error deleting comment" });
    }
  },
};
