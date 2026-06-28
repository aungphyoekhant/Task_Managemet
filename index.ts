import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});
//---------------------------------------------------------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.clear();
  console.log(`Server is running at Port ${PORT}...`);
});
