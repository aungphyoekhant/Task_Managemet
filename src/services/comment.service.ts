import { prisma } from "../lib/prisma.js";
import { auditService } from "./audit.service.js";

type CommentType = {
  taskId: number;
  authorId: number;
  content: string;
};

export const commentService = {
 getCommentsByTaskId: async (taskId: number) => {
    return await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            email: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
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

      console.log(`user id : ${data.authorId}, workspac id : ${task.workspaceId}`);

      await tx.notification.create({
        data: {
          workspaceId: task.workspaceId,
          userId: data.authorId,
          message: `New comment added to task ID ${data.taskId}`,
        },
      });

      await auditService.ActivityLog({
        userId: data.authorId,
        action: "CREATE_COMMENT",
        entityType: "TASK",
        entityId: data.taskId,
      });

      return newComment;
    });
  },

  updateComment: async (taskId: number, commentId: number, authorId: number, content: string) => {
    return await prisma.$transaction(async (tx) => {
      const updatedComment = await tx.comment.update({
        where: {taskId: taskId, id: commentId, authorId },
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

      await auditService.ActivityLog({
        userId: authorId,
        action: "UPDATE_COMMENT",
        entityType: "TASK",
        entityId: commentId,
      });

      return updatedComment;
    });
  },

  deleteComment: async (taskId: number, commentId: number, authorId: number) => {
    try {
      return await prisma.$transaction(async (tx) => {
      
        const comment = await tx.comment.delete({
          where: { taskId: taskId, id: commentId, authorId },
        });

        const notification = await tx.notification.create({
          data: {
            workspaceId: comment.workspaceId,
            userId: authorId,
            message: `Comment deleted to task ID ${comment.taskId}`,
          },
        });

        
        await tx.userNoti.create({
          data: {
            userId: authorId,
            notificationId: notification.id,
          },
        });

        
        await auditService.ActivityLog({
          userId: authorId,
          action: "DELETE_COMMENT",
          entityType: "TASK",
          entityId: commentId,
        });

        return comment; 
      });
    } catch (error) {
      console.error("Delete Comment Error:", error);
      return null;
    }
  },
};
