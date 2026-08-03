/*
  Warnings:

  - Added the required column `message` to the `UserNoti` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserNoti" DROP CONSTRAINT "UserNoti_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserNoti" ADD COLUMN     "message" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserNoti" ADD CONSTRAINT "UserNoti_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
