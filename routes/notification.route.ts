import express from "express";
import { auth } from "../middlewares/authMiddleware";
import { notificationController } from "../controllers/notification.controller";

export const router = express.Router();

router.patch("/notifications/:id/read", auth, notificationController.markNotificationAsRead);
router.get("/notifications", auth, notificationController.getNotifications);
router.patch("/notifications/read-all", auth, notificationController.markAllAsRead);
router.delete("/notifications/:id", auth, notificationController.deleteNotification);
router.delete("/all-notifications", auth, notificationController.deleteNotification);
