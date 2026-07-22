import { Router } from "express";
import { userNotiController } from "../controllers/user-noti.controller";
import { auth } from "../middlewares/authMiddleware";

const router = Router();

// Notification စနစ်
router.get("/usreNoti", auth, userNotiController.getNotifications); // Fetch
router.patch("/userNoit/:id/read", auth, userNotiController.markNotificationAsRead); // Update Read/Unread
router.delete("/userNoti/all", auth, userNotiController.deleteAllNotifications); // Delete All
router.delete("/userNoti/:id", auth, userNotiController.deleteNotification); // Delete One

export default router;
