-- DropForeignKey
ALTER TABLE "UserNoti" DROP CONSTRAINT "UserNoti_notificationId_fkey";

-- AddForeignKey
ALTER TABLE "UserNoti" ADD CONSTRAINT "UserNoti_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
