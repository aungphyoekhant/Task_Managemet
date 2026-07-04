/*
  Warnings:

  - You are about to drop the column `assingedTo` on the `ProjectUser` table. All the data in the column will be lost.
  - Added the required column `addedById` to the `ProjectUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProjectUser_userId_key";

-- AlterTable
ALTER TABLE "ProjectUser" DROP COLUMN "assingedTo",
ADD COLUMN     "addedById" INTEGER NOT NULL;
