import express from "express";
import { prisma } from "../lib/prisma";
import { userAuth } from "../middlewares/user-auth";

export const router = express.Router();

router.get("/", userAuth, (req: any, res) => {
  const user = res.locals.user;
  res.json({
    email: user.email,
    name: user.profile.name,
  });
});

router.post("/", userAuth, async (req, res) => {
  const { name, avatar } = req.body;
  const user = res.locals.user;
  const userId = user.id;

  if (!name || !avatar) {
    return res.status(400).json({ msg: "Name and Avatar are required" });
  }

  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { name, avatar },
      create: {
        name,
        avatar,
        userId,
      },
    });

    res.json({
      con: true,
      msg: "Saved Successfully Profile",
      result: {
        ...profile,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Profile Save Error:", error);
    res.status(500).json({ msg: "Error saving profile" });
  }
});
