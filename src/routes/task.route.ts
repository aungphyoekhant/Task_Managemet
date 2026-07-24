import express from "express"; 
import { taskController } from "../controllers/task.controller.js";
import { auth } from "../middlewares/authMiddleware.js";
import { checkWorkspaceRole } from "../middlewares/roleMiddleware.js";

export const router = express.Router();

router.get("/allTasks", auth, checkWorkspaceRole(["OWNER", "ADMIN","MEMBER"]), taskController.getTasks);

router.post("/tasks", auth, checkWorkspaceRole(["OWNER", "ADMIN","MEMBER" ]), taskController.createTask);

router.get("/tasks/:taskId", taskController.getTaskById);

router.put("/tasks/:taskId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), taskController.updateTask);

router.put("/tasks/assigned/:taskId", auth, checkWorkspaceRole(["OWNER", "ADMIN"]), taskController.updateAssignedTask);

router.delete("/tasks/:taskId", auth, checkWorkspaceRole(["OWNER", "ADMIN", "MEMBER"]), taskController.deleteTask);
