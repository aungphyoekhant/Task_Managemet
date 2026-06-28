/*
  Warnings:

  - Added the required column `projectUserId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "projectUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectUserId_fkey" FOREIGN KEY ("projectUserId") REFERENCES "ProjectUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
