/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `ProjectUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assingedTo` to the `ProjectUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectUser" ADD COLUMN     "assingedTo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUser_userId_key" ON "ProjectUser"("userId");
