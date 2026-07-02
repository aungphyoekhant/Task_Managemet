import express from "express";
import { commentController } from "../controllers/comment.controller";
import { auth } from "../middlewares/authMiddleware";

export const router = express.Router();

router.post("/:taskId/comments", auth, commentController.addComment);
router.get("/:taskId/comments", commentController.getComments);
router.put("/:commentId", auth, commentController.updateComment);
router.delete("/:commentId", auth, commentController.deleteComment);
