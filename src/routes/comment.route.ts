import express from "express";
import { commentController } from "../controllers/comment.controller.js";
import { auth } from "../middlewares/authMiddleware.js";

export const router = express.Router();

router.post("/tasks/:taskId/comments", auth, commentController.addComment);
router.get("/tasks/:taskId/comments", auth, commentController.getComments); 
router.put("/tasks/:taskId/comments/:commentId", auth, commentController.updateComment);
router.delete("/tasks/:taskId/comments/:commentId", auth, commentController.deleteComment);