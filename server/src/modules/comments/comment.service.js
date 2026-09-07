import mongoose from "mongoose";

import Comment from "./comment.model.js";
import Post from "../posts/post.model.js";
import ApiError from "../../utils/ApiError.js";

const createComment = async ({ userId, postId, content }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const session = await mongoose.startSession();

  try {
    let comment;

    await session.withTransaction(async () => {
      const post = await Post.exists({
        _id: postId,
      }).session(session);

      if (!post) {
        throw new ApiError(404, "Post not found.");
      }

      const createdComments = await Comment.create(
        [
          {
            user: userId,
            post: postId,
            content,
          },
        ],
        {
          session,
        },
      );

      comment = createdComments[0];
    });

    return comment;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const getComments = async ({ postId, page, limit }) => {
  const post = await Post.exists({
    _id: postId,
  });

  if (!post) {
    throw new ApiError(404, "Post not found.");
  }

  const skip = (page - 1) * limit;

  const filter = {
    post: postId,
  };

  const [comments, totalComments] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username fullName avatar isVerified")
      .lean(),

    Comment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalComments / limit);

  return {
    comments,
    pagination: {
      page,
      limit,
      totalComments,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const deleteComment = async ({ userId, commentId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    user: userId,
  });

  if (!comment) {
    throw new ApiError(
      404,
      "Comment not found or you are not authorized to delete it.",
    );
  }

  return comment;
};

export { createComment, getComments, deleteComment };
