import express from "express"; // သင့် express ကို အသုံးပြုခြင်း
import { taskController } from "../controllers/task.controller";
import { auth } from "../middlewares/authMiddleware";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();

router.get("/allTasks", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), taskController.getTasks);

router.post("/tasks", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), taskController.createTask);

router.get("/:taskId", auth, taskController.getTaskById);

router.put("/:taskId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), taskController.updateTask);

router.put("/assigned/:taskId", auth, taskController.updateAssignedTask);

router.delete("/:taskId", auth, taskController.deleteTask);
