import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createFollow,
  getFollowers,
  getFollowing,
  deleteFollow,
  getFollowCounts
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
    .json(new ApiResponse(200, result, "Followers fetched successfully."));
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
    .json(new ApiResponse(200, result, "Following fetched successfully."));
});

const deleteFollowController = asyncHandler(async (req, res) => {
  const { userId: followingId } = req.validatedData.params;

  await deleteFollow({
    followerId: req.user._id,
    followingId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User unfollowed successfully."));
});

const getFollowCountsController = asyncHandler(async (req, res) => {
  const { userId } = req.validatedData.params;

  const counts = await getFollowCounts({
    userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, counts, "Follow counts fetched successfully."));
});

export {
  createFollowController,
  getFollowersController,
  getFollowingController,
  deleteFollowController,
  getFollowCountsController
};
