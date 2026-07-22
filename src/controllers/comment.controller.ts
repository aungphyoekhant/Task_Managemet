import { Request, Response } from "express";
import { commentService } from "../services/comment.service";
import { addCommentValidator,updateCommentValidator } from "../validators/comment";

export const commentController = {
  addComment : async (req: Request, res: Response) => {
    try {
     const { error: paramsError, value: paramsValue } = addCommentValidator.params.validate(req.params);

     const { error: bodyError, value: bodyValue } = addCommentValidator.body.validate(req.body);

     if (paramsError) return res.status(400).json({ con: false, msg: paramsError.details[0].message });

     if (bodyError) return res.status(400).json({ con: false, msg: bodyError.details[0].message });

     const { taskId } = paramsValue;
     const { content } = bodyValue;
     const authorId = res.locals.user.id;

     const newComment = await commentService.createComment({
       taskId,
       authorId,
       content,
      });

     return res.status(201).json({ 
       con: true, 
       msg: "Comment added", 
       data: newComment 
    });

  } catch (error: any) {
    console.error("Add Comment Error:", error);
    
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

 updateComment : async (req: Request, res: Response) => {
  try {

    const { error: paramsError, value: paramsValue } = updateCommentValidator.params.validate(req.params);
    
    const { error: bodyError, value: bodyValue } = updateCommentValidator.body.validate(req.body);

    if (paramsError) return res.status(400).json({ con: false, msg: paramsError.details[0].message });

    if (bodyError) return res.status(400).json({ con: false, msg: bodyError.details[0].message });

    const { commentId } = paramsValue;
    const { content } = bodyValue;
    const authorId = res.locals.user.id;

    const result = await commentService.updateComment(Number(commentId), authorId, content);

    if (!result) {
      return res.status(404).json({ con: false, msg: "Comment not found or unauthorized" });
    }

    return res.status(200).json({ con: true, msg: "Comment updated successfully" });

  } catch (error: any) {
    console.error("Update Comment Error:", error);
    return res.status(500).json({ con: false, msg: error.message || "Error updating comment" });
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
