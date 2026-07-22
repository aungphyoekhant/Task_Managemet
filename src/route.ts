import expresss from "express";
const router = expresss.Router();

import { router as profileRouter } from "../src/routes/profile.route";
import { router as workspaceRouter } from "./routes/workspace.route";
import { router as workspaceInvitedRouter } from "./routes/workspace_invited.route";
import { router as userRouter } from "./routes/user.route";
import { router as invitationRouter } from "./routes/invitation.route";
import { router as projectRouter } from "./routes/project.route";
import { router as memberRouter } from "./routes/member.route";
import { router as taskRouter } from "./routes/task.route";
import { router as projectUserRouter } from "./routes/project_user.route";
import { router as dashboardRouter } from "./routes/dashboard.route";
import { router as searchRouter } from "./routes/search.route";
import { router as updateRoleRouter } from "./routes/update_role.route";
import { router as commentRouter } from "./routes/comment.route";
import { router as activityRouter } from "./routes/activity.route";
import { router as workspaceUserRouter } from "./routes/workspace-user.route";
import { router as notificationRouter } from "./routes/notification.route";
import { router as taskUserRouter } from "./routes/task_user.route";

router.use(notificationRouter);
router.use(workspaceUserRouter);
router.use(searchRouter);
router.use(dashboardRouter);
router.use(userRouter);
router.use(workspaceRouter);
router.use(profileRouter);
router.use(workspaceInvitedRouter);
router.use(invitationRouter);
router.use(projectRouter);
router.use(projectUserRouter);
router.use(updateRoleRouter);
router.use(memberRouter);
router.use(taskRouter);
router.use(taskUserRouter);
router.use(commentRouter);
router.use(activityRouter);


export default router;
