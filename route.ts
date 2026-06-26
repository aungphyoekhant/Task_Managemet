// routes/index.ts
import expresss from "express";
const router = expresss.Router();

import { router as userRouter } from "./routes/user";
import { router as profileRouter } from "./routes/profile";
import { router as workspaceRouter } from "./routes/workspace";
import { router as workspaceInvitedRouter } from "./routes/workspaceInvited";
import { router as authUserRouter } from "./routes/userAuth";
import { router as invitationRouter } from "./routes/invitation";
import { router as projectRouter } from "./routes/project";
import { router as updateRoleRouter } from "./routes/updateRole";
import { router as memberRouter } from "./routes/member";

router.use("/userAuth", authUserRouter);
router.use("/users", workspaceRouter);
router.use("/users", userRouter);
router.use("/users", profileRouter);
router.use("/users", workspaceInvitedRouter);
router.use("/users", invitationRouter);
router.use("/users", projectRouter);
router.use("/users", updateRoleRouter);
router.use("/workspaces", memberRouter);

export default router;
