import { prisma } from "../lib/prisma";
import { ActivityLog } from "../services/audit.service";

type CommentType = {
  taskId: number;
  authorId: number;
  content: string;
};

export const commentService = {
  getCommentsByTaskId: async (taskId: number) => {
    return await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });
  },

  createComment: async (data: CommentType) => {
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      select: { workspaceId: true },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    return await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          workspaceId: task.workspaceId,
          taskId: data.taskId,
          authorId: data.authorId,
          content: data.content,
        },
      });

      await tx.notification.create({
        data: {
          workspaceId: task.workspaceId,
          userId: data.authorId,
          message: `New comment added to task ID ${data.taskId}`,
        },
      });

      await ActivityLog(tx, {
        workspaceId: task.workspaceId,
        userId: data.authorId,
        action: "CREATE_COMMENT",
        entityType: "TASK",
        entityId: data.taskId,
      });

      return newComment;
    });
  },

  updateComment: async (commentId: number, authorId: number, content: string) => {
    return await prisma.$transaction(async (tx) => {
      const updatedComment = await tx.comment.update({
        where: { id: commentId, authorId },
        data: { content },
      });

      const notification = await tx.notification.create({
        data: {
          workspaceId: updatedComment.workspaceId,
          userId: authorId,
          message: `Comment updated to task ID ${updatedComment.taskId}`,
        },
      });

      await tx.userNoti.create({
        data: {
          userId: authorId,
          notificationId: notification.id,
        },
      });

      await ActivityLog(tx, {
        workspaceId: updatedComment.workspaceId,
        userId: authorId,
        action: "UPDATE_COMMENT",
        entityType: "TASK",
        entityId: commentId,
      });

      return updatedComment;
    });
  },

  deleteComment: async (commentId: number, authorId: number) => {
    try {
      return await prisma.$transaction(async (tx) => {
        // ၁။ Comment ကို Delete လုပ်ပါ
        const comment = await tx.comment.delete({
          where: { id: commentId, authorId }, // AuthorID ပါထည့်စစ်ခြင်းဖြင့် Security ပိုကောင်းစေပါတယ်
        });

        // ၂။ Notification ဖန်တီးပါ
        const notification = await tx.notification.create({
          data: {
            workspaceId: comment.workspaceId,
            userId: authorId,
            message: `Comment deleted to task ID ${comment.taskId}`,
          },
        });

        // ၃။ UserNoti ဖန်တီးပါ
        await tx.userNoti.create({
          data: {
            userId: authorId,
            notificationId: notification.id,
          },
        });

        // ၄။ Activity Log (AWAIT လုပ်ပေးပါ)
        await ActivityLog(tx, {
          workspaceId: comment.workspaceId,
          userId: authorId,
          action: "DELETE_COMMENT",
          entityType: "TASK", // သင့် DB Schema အတိုင်း သေချာစစ်ပါ
          entityId: commentId,
        });

        return comment; // အောင်မြင်ရင် Deleted comment ကိုပြန်ပေးလိုက်ပါ
      });
    } catch (error) {
      console.error("Delete Comment Error:", error);
      return null;
    }
  },
};
