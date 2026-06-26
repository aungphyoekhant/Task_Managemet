import express from "express";
import cors from "cors";
import "dotenv/config";
import { logger } from "./lib/logger";
import { requestLogger } from "./middlewares/requset-logger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(requestLogger);

import rootRouter from "./route";
app.use(rootRouter);

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
