import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import { followUser, unfollowUser } from "./follow.service.js";

const follow = asyncHandler(async (req, res) => {
  const result = await followUser(
    req.user._id,
    req.validatedData.params.userId,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "User followed successfully.", result));
});

const unfollow = asyncHandler(async (req, res) => {
  await unfollowUser(req.user._id, req.validatedData.params.userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "User unfollowed successfully."));
});

export { follow, unfollow };
