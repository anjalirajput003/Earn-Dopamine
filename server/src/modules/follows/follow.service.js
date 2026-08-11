import User from "../users/user.model.js";
import Follow from "./follow.model.js";
import ApiError from "../../utils/ApiError.js";

const followUser = async (followerId, targetUserId) => {
  if (followerId.equals(targetUserId)) {
    throw new ApiError(400, "You cannot follow yourself.");
  }

  const targetUser = await User.findById(targetUserId).select("_id");

  if (!targetUser) {
    throw new ApiError(404, "User not found.");
  }

  const existingFollow = await Follow.exists({
    follower: followerId,
    following: targetUserId,
  });

  if (existingFollow) {
    throw new ApiError(409, "You are already following this user.");
  }

  const follow = await Follow.create({
    follower: followerId,
    following: targetUserId,
  });

  return follow;
};

const unfollowUser = async (followerId, targetUserId) => {
  if (followerId.equals(targetUserId)) {
    throw new ApiError(400, "You cannot unfollow yourself.");
  }

  const deletedFollow = await Follow.findOneAndDelete({
    follower: followerId,
    following: targetUserId,
  });

  if (!deletedFollow) {
    throw new ApiError(404, "You are not following this user.");
  }

  return deletedFollow;
};

export { followUser, unfollowUser };
