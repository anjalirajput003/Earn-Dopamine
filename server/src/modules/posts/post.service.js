import Post from "./post.model.js";
import ApiError from "../../utils/ApiError.js";

import {
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";

import { CLOUDINARY_FOLDERS } from "../../constants/cloudinary.js";
import { USER_PUBLIC_PROFILE_FIELDS } from "../../constants/populate.js";
import User from "../users/user.model.js";

//post service
const createNewPost = async ({ ownerId, postData, files }) => {
  let uploadedMedia = [];

  try {
    if (files?.length) {
      uploadedMedia = await uploadMultipleToCloudinary(
        files,
        CLOUDINARY_FOLDERS.POSTS,
      );
    }

    const post = await Post.create({
      owner: ownerId,
      caption: postData.caption,
      visibility: postData.visibility,
      media: uploadedMedia,
    });

    return await Post.findById(post._id).populate(
      "owner",
      USER_PUBLIC_PROFILE_FIELDS,
    );
  } catch (error) {
    await Promise.all(
      uploadedMedia.map((media) => deleteFromCloudinary(media.publicId)),
    );

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      error.message || "Something went wrong while creating the post.",
    );
  }
};

const getPostById = async (postId) => {
  const post = await Post.findById(postId)
    .populate("owner", USER_PUBLIC_PROFILE_FIELDS)
    .lean();

  if (!post) {
    throw new ApiError(404, "Post not found.");
  }

  return post;
};

const getUserPosts = async ({ username, page, limit }) => {
  const user = await User.findOne({
    username: {
      $regex: `^${username}$`,
      $options: "i",
    },
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const filter = {
    owner: user._id,
  };

  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .populate("owner", USER_PUBLIC_PROFILE_FIELDS)
      .lean(),

    Post.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

  return {
    posts,
    pagination: {
      page,
      limit,
      totalPosts,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

//feed service
const getFeedPosts = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const filter = {
    visibility: "public",
  };

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", USER_PUBLIC_PROFILE_FIELDS)
      .lean(),

    Post.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

  return {
    posts,

    pagination: {
      page,
      limit,
      totalPosts,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export { createNewPost, getFeedPosts, getPostById, getUserPosts };
