import express from "express"; // သင့် express ကို အသုံးပြုခြင်း
import { taskController } from "../controllers/task.controller";
import { auth } from "../middlewares/authMiddleware";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware";

export const router = express.Router();

router.get("/allTasks", auth, checkWorkspaceRole(["OWNER", "ADMIN","MEMBER"]), taskController.getTasks);

router.post("/tasks", auth, checkWorkspaceRole(["OWNER", "ADMIN","MEMBER" ]), taskController.createTask);

router.get("/tasks/:taskId", taskController.getTaskById);

router.put("/tasks/:taskId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), taskController.updateTask);

router.put("/tasks/assigned/:taskId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), taskController.updateAssignedTask);

router.delete("/tasks/:taskId", auth, checkWorkspaceRole(["OWNER", "ADMIN", "MEMBER"]), taskController.deleteTask);
