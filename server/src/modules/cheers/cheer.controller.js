import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import { createCheer, removeCheer } from "./cheer.service.js";

const createCheerController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;

  const cheer = await createCheer({
    userId: req.user._id,
    postId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, cheer, "Post cheered successfully."));
});

const removeCheerController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;

  await removeCheer({
    userId: req.user._id,
    postId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Cheer removed successfully."));
});

export { createCheerController, removeCheerController };
