import mongoose from "mongoose";

import Cheer from "./cheer.model.js";
import Post from "../posts/post.model.js";
import ApiError from "../../utils/ApiError.js";

const createCheer = async ({ userId, postId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const session = await mongoose.startSession();

  try {
    let cheer;

    await session.withTransaction(async () => {
      const post = await Post.exists({
        _id: postId,
      }).session(session);

      if (!post) {
        throw new ApiError(404, "Post not found.");
      }

      const createdCheers = await Cheer.create(
        [
          {
            user: userId,
            post: postId,
          },
        ],
        {
          session,
        },
      );

      cheer = createdCheers[0];

      const result = await Post.updateOne(
        {
          _id: postId,
        },
        {
          $inc: {
            cheersCount: 1,
          },
        },
        {
          session,
        },
      );

      if (result.matchedCount === 0) {
        throw new ApiError(404, "Post not found.");
      }
    });

    return cheer;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.code === 11000) {
      throw new ApiError(409, "You have already cheered this post.");
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const removeCheer = async ({ userId, postId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const deletedCheer = await Cheer.findOneAndDelete(
        {
          user: userId,
          post: postId,
        },
        {
          session,
        },
      );

      if (!deletedCheer) {
        throw new ApiError(404, "You have not cheered this post.");
      }

      const result = await Post.updateOne(
        {
          _id: postId,
        },
        {
          $inc: {
            cheersCount: -1,
          },
        },
        {
          session,
        },
      );

      if (result.matchedCount === 0) {
        throw new ApiError(404, "Post not found.");
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const checkCheerStatus = async ({ userId, postId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const cheer = await Cheer.exists({
    user: userId,
    post: postId,
  });

  return {
    cheered: Boolean(cheer),
  };
};

export { createCheer, removeCheer, checkCheerStatus };
