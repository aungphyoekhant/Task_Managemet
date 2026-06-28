/*
  Warnings:

  - You are about to drop the column `workspaceId` on the `ProjectUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectUser" DROP CONSTRAINT "ProjectUser_workspaceId_fkey";

-- AlterTable
ALTER TABLE "ProjectUser" DROP COLUMN "workspaceId";
