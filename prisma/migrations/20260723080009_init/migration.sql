/*
  Warnings:

  - You are about to drop the column `workspaceId` on the `ActivityLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_workspaceId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "workspaceId";
