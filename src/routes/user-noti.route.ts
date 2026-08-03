import { Router } from "express";
import { Controller } from "../controllers/user-noti.controller.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = Router();

// Notification စနစ်
router.get("/", auth, Controller.getNotifications); // Fetch
router.patch("/userNoit/:id/read", auth, Controller.markNotificationAsRead); // Update Read/Unread
router.delete("//all", auth, Controller.deleteAllNotifications); // Delete All
router.delete("//:id", auth, Controller.deleteNotification); // Delete One

export default router;
