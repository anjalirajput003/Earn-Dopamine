import mongoose from "mongoose";

import Follow from "./follow.model.js";
import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { createNotification } from "../notifications/notification.service.js";

const createFollow = async ({ followerId, followingId }) => {
  if (followerId.toString() === followingId.toString()) {
    throw new ApiError(400, "You cannot follow yourself.");
  }

  const user = await User.exists({
    _id: followingId,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const existingFollow = await Follow.exists({
    follower: followerId,
    following: followingId,
  });

  if (existingFollow) {
    throw new ApiError(409, "You are already following this user.");
  }

  const follow = await Follow.create({
    follower: followerId,
    following: followingId,
  });

  //creating notification for the follow using the notification service
  await createNotification({
    recipient: followingId,
    actor: followerId,
    type: "follow",
    message: "started following you.",
  });

  return follow;
};;

const getFollowers = async ({ userId, page, limit }) => {
  const user = await User.exists({
    _id: userId,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    Follow.find({
      following: userId,
    })
      .populate("follower", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Follow.countDocuments({
      following: userId,
    }),
  ]);

  return {
    followers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFollowing = async ({ userId, page, limit }) => {
  const user = await User.exists({
    _id: userId,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const skip = (page - 1) * limit;

  const [following, total] = await Promise.all([
    Follow.find({
      follower: userId,
    })
      .populate("following", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Follow.countDocuments({
      follower: userId,
    }),
  ]);

  return {
    following,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const deleteFollow = async ({ followerId, followingId }) => {
  const follow = await Follow.findOneAndDelete({
    follower: followerId,
    following: followingId,
  });

  if (!follow) {
    throw new ApiError(404, "Follow relationship not found.");
  }

  return follow;
};

const getFollowCounts = async ({ userId }) => {
  const user = await User.exists({
    _id: userId,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const [followers, following] = await Promise.all([
    Follow.countDocuments({
      following: userId,
    }),

    Follow.countDocuments({
      follower: userId,
    }),
  ]);

  return {
    followers,
    following,
  };
};

export { createFollow, getFollowers, getFollowing, deleteFollow, getFollowCounts };
