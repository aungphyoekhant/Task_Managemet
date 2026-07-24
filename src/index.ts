import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";
import fs from "fs"
import { fileURLToPath } from 'url';
import rootRouter from "./route.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  if (req.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), req.url);
    console.log("Checking file at:", filePath);
    console.log("Does file exist?", fs.existsSync(filePath));
  }
  next();
});


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use(rootRouter);

app.get("/", (req, res) => {
  res.json({ msg: `SERVER IS RUNNING ON PORT ${PORT}` });
});

app.use((req, res) => {
  res.status(404).json({ msg: "Not found route" });
});

app.listen(PORT, () => {
  console.log(`Server is running at Port ${PORT}...`);
});