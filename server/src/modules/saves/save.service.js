import Save from "./save.model.js";
import Post from "../posts/post.model.js";
import ApiError from "../../utils/ApiError.js";

const savePost = async (userId, postId) => {
  const postExists = await Post.exists({
    _id: postId,
  });

  if (!postExists) {
    throw new ApiError(404, "Post not found.");
  }

  const existingSave = await Save.exists({
    user: userId,
    post: postId,
  });

  if (existingSave) {
    throw new ApiError(409, "Post is already saved.");
  }

  return await Save.create({
    user: userId,
    post: postId,
  });
};

const unsavePost = async (userId, postId) => {
  const deletedSave = await Save.findOneAndDelete({
    user: userId,
    post: postId,
  });

  if (!deletedSave) {
    throw new ApiError(404, "Post is not saved.");
  }

  return deletedSave;
};

const checkSavedPost = async (userId, postId) => {
  return Boolean(
    await Save.exists({
      user: userId,
      post: postId,
    }),
  );
};

const getSavedPosts = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [savedPosts, total] = await Promise.all([
    Save.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "post",
        populate: {
          path: "owner",
          select: "username name avatar",
        },
      })
      .lean(),

    Save.countDocuments({
      user: userId,
    }),
  ]);

  const posts = savedPosts.filter((save) => save.post).map((save) => save.post);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
    },
  };
};

export { savePost, unsavePost, checkSavedPost, getSavedPosts };
