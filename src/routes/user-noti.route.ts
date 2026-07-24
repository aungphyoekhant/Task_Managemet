import { Router } from "express";
import { userNotiController } from "../controllers/user-noti.controller.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = Router();

// Notification စနစ်
router.get("/userNoti", auth, userNotiController.getNotifications); // Fetch
router.patch("/userNoit/:id/read", auth, userNotiController.markNotificationAsRead); // Update Read/Unread
router.delete("/userNoti/all", auth, userNotiController.deleteAllNotifications); // Delete All
router.delete("/userNoti/:id", auth, userNotiController.deleteNotification); // Delete One

export default router;
