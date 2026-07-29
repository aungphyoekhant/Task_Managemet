-- CreateIndex
CREATE INDEX "ProjectUser_workspaceId_idx" ON "ProjectUser"("workspaceId");

-- CreateIndex
CREATE INDEX "TaskUser_workspaceId_idx" ON "TaskUser"("workspaceId");

-- CreateIndex
CREATE INDEX "TaskUser_projectId_idx" ON "TaskUser"("projectId");

-- CreateIndex
CREATE INDEX "TaskUser_userId_idx" ON "TaskUser"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_workspaceId_idx" ON "WorkspaceUser"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_userId_idx" ON "WorkspaceUser"("userId");

-- AddForeignKey
ALTER TABLE "TaskUser" ADD CONSTRAINT "TaskUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUser" ADD CONSTRAINT "TaskUser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
