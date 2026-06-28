import express from "express"; // သင့် express ကို အသုံးပြုခြင်း
import { taskController } from "../controllers/taskController";
import { auth } from "../middlewares/authMiddleware";

export const router = express.Router();

router.post("/tasks", auth, taskController.createTask);
router.get("/:taskId", auth, taskController.getTaskById);
router.put("/:taskId", auth, taskController.updateTask);
router.put("/assigned/:taskId", auth, taskController.updateAssignedTask);
router.delete("/:taskId", auth, taskController.deleteTask);
