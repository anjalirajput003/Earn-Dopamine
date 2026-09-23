import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createFollow,
  getFollowers,
  getFollowing,
  deleteFollow,
  getFollowCounts,
  checkFollowStatus,
} from "./follow.service.js";

const createFollowController = asyncHandler(async (req, res) => {
  const { userId: followingId } = req.validatedData.params;

  const follow = await createFollow({
    followerId: req.user._id,
    followingId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "User followed successfully.", follow));
});

const getFollowersController = asyncHandler(async (req, res) => {
  const { userId } = req.validatedData.params;
  const { page, limit } = req.validatedData.query;

  const result = await getFollowers({
    userId,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Followers fetched successfully.", result));
});

const getFollowingController = asyncHandler(async (req, res) => {
  const { userId } = req.validatedData.params;
  const { page, limit } = req.validatedData.query;

  const result = await getFollowing({
    userId,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Following fetched successfully.", result));
});

const deleteFollowController = asyncHandler(async (req, res) => {
  const { userId: followingId } = req.validatedData.params;

  await deleteFollow({
    followerId: req.user._id,
    followingId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "User unfollowed successfully.", null));
});

const getFollowCountsController = asyncHandler(async (req, res) => {
  const { userId } = req.validatedData.params;

  const counts = await getFollowCounts({
    userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Follow counts fetched successfully.", counts));
});

const checkFollowStatusController = asyncHandler(async (req, res) => {
  const { userId: followingId } = req.validatedData.params;

  const result = await checkFollowStatus({
    followerId: req.user._id,
    followingId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Follow status fetched successfully.", result));
});

export {
  createFollowController,
  getFollowersController,
  getFollowingController,
  deleteFollowController,
  getFollowCountsController,
  checkFollowStatusController,
};
