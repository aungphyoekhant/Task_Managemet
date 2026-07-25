import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { notificationController } from "../controllers/notification.controller.js";

export const router = express.Router();

router.patch("/notifications/:notificationId/read", auth, notificationController.markNotificationAsRead);
router.get("/notifications", auth, notificationController.getNotifications);
router.patch("/notifications/read-all", auth, notificationController.markAllAsRead);
router.delete("/notifications/:notificationId", auth, notificationController.deleteNotification);
router.delete("/all-notifications", auth, notificationController.deleteAllNotifications);
