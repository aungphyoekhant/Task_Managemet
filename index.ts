import express from "express";
import cors from "cors";
import "dotenv/config";
import { requestLogger } from "./middlewares/requset-logger";
import { logger } from "./lib/logger";

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//------------------------------------------------------------------------------
import { router as userRouter } from "./routes/user";
import { router as profileRouter } from "./routes/profile";
import { router as workspaceRouter } from "./routes/workspace";
import { router as workspaceInvitedRouter } from "./routes/workspaceInvited";

app.use("/users", workspaceRouter);
app.use("/users", userRouter);
app.use("/users", profileRouter);
app.use("/users", workspaceInvitedRouter);
//------------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({ msg: `SERVER IS RUNNING ON PORT ${PORT}` });
});

app.use((req, res) => {
  res.status(404).json({
    msg: "Not found route",
  });
});
//---------------------------------------------------------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.clear();
  logger.info(`Server is running on port ${PORT}... `);
});
