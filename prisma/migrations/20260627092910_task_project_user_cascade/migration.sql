-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectUserId_fkey";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectUserId_fkey" FOREIGN KEY ("projectUserId") REFERENCES "ProjectUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
