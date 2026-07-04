-- AlterTable
ALTER TABLE "UserNoti" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ProjectUser_userId_idx" ON "ProjectUser"("userId");

-- CreateIndex
CREATE INDEX "ProjectUser_projectId_idx" ON "ProjectUser"("projectId");
