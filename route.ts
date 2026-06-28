// routes/index.ts
import expresss from "express";
const router = expresss.Router();

import { router as profileRouter } from "./routes/profile";
import { router as workspaceRouter } from "./routes/workspace";
import { router as workspaceInvitedRouter } from "./routes/workspaceInvited";
import { router as userRouter } from "./routes/user";
import { router as invitationRouter } from "./routes/invitation";
import { router as projectRouter } from "./routes/project";
import { router as updateRoleRouter } from "./routes/updateRole";
import { router as memberRouter } from "./routes/member";
import { router as taskRouter } from "./routes/task";
import { router as projectUserRouter } from "./routes/projectUser";

router.use(userRouter);
router.use(workspaceRouter);
router.use(profileRouter);
router.use(workspaceInvitedRouter);
router.use(invitationRouter);
router.use("/workspaces", projectRouter);
router.use("/workspaces", projectUserRouter);
router.use(updateRoleRouter);
router.use(memberRouter);
router.use(taskRouter);

export default router;
