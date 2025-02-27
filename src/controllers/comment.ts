import type { RequestHandler, Request } from 'express';
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';
import { Comment } from '../domain/comment.ts';

interface CustomRequest extends Request {
  user?: { id: number };
}

export const create: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const { content, postId } = req.body;

    if (!content || !postId) {
      return sendDataResponse(res, 400, { error: 'Content and postId are required' });
    }

    if (!req.body.user) {
      return sendDataResponse(res, 401, { error: 'Unauthorized' });
    }

    const authorId = req.body.user.id;
    const newComment = await Comment.createComment(content, postId, authorId);

    return sendDataResponse(res, 201, { comment: newComment });
  } catch (error) {
    console.error('Error in create:', error);
    return sendMessageResponse(res, 500, 'Unable to create comment');
  }
};

export const getByPost: RequestHandler = async (req, res) => {
  try {
    const { Id } = req.params;
    const comments = await Comment.getCommentsByPost(Number(Id));
    return sendDataResponse(res, 200, { comments });
  } catch (error) {
    console.error('Error in getByPost:', error);
    return sendMessageResponse(res, 500, 'Unable to fetch comments');
  }
};

export const getAllComments: RequestHandler = async (_req, res) => {
    try {
      const comments = await Comment.getAllComments();
      return sendDataResponse(res, 200, { comments });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return sendMessageResponse(res, 500, 'Unable to fetch users');
    }
  };

export const getByUser: RequestHandler = async (req: CustomRequest, res) => {
  try {
    if (!req.body.user) {
      return sendDataResponse(res, 401, { error: 'Unauthorized' });
    }

    const userId = req.body.user.id;
    const comments = await Comment.getCommentsByUser(userId);
    return sendDataResponse(res, 200, { comments });
  } catch (error) {
    console.error('Error in getByUser:', error);
    return sendMessageResponse(res, 500, 'Unable to fetch user comments');
  }
};

export const update: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return sendDataResponse(res, 400, { error: 'Content is required' });
    }

    const updatedComment = await Comment.updateComment(Number(id), content);
    return sendDataResponse(res, 200, { comment: updatedComment });
  } catch (error) {
    console.error('Error in update:', error);
    return sendMessageResponse(res, 500, 'Unable to update comment');
  }
};

export const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.deleteComment(Number(id));
    return sendDataResponse(res, 200, { message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error in remove:', error);
    return sendMessageResponse(res, 500, 'Unable to delete comment');
  }
};
