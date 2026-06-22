// prisma/seed.ts
import { seedUsers } from "./seedUsers";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting seeding...");
  const seeders = [seedUsers];
  console.log(seeders);

  for (const seed of seeders) {
    await seed();
  }
}

console.log("Executing seeding...");

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
