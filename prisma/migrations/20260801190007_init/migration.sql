-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createBy_fkey";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createBy_fkey" FOREIGN KEY ("createBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
