/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Made the column `name` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name";
