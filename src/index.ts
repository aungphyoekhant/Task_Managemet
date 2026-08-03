import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import { fileURLToPath } from 'url';
import http from "http";
import { Server } from "socket.io";
import rootRouter from "./route.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

export const io = new Server(server, {
  cors: {
    origin: [
      "https://taskmgr.denogameshop.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://165.227.168.23",
      "http://165.227.168.23:80"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected via socket:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: [
      "https://taskmgr.denogameshop.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://165.227.168.23",
      "http://165.227.168.23:80"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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

server.listen(PORT, () => {
  console.log(`Server with Socket.io is running at Port ${PORT}...`);
});