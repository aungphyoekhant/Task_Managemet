import express from "express";
import { commentController } from "../controllers/comment.controller.js";
import { auth } from "../middlewares/authMiddleware.js";

export const router = express.Router();

router.post("/:taskId/comments", auth, commentController.addComment);
router.get("/:taskId/comments", auth, commentController.getComments);
router.put("/comments/:commentId", auth, commentController.updateComment);
router.delete("/comments/:commentId", auth, commentController.deleteComment);
