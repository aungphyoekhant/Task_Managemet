import { prisma } from "../lib/prisma";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

export async function seedUsers() {
  const password = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "alex@gmail.com" },
    update: {},
    create: {
      email: "alex@gmail.com",
      password: password,
      role: "OWNER",
    },
  });
}
