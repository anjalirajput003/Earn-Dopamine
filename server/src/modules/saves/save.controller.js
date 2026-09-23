import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  checkSavedPost,
  getSavedPosts,
  savePost,
  unsavePost,
} from "./save.service.js";

const savePostController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;

  await savePost(req.user._id, postId);

  return res.status(201).json(
    new ApiResponse(201, "Post saved successfully.", {
      saved: true,
    }),
  );
});

const unsavePostController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;

  await unsavePost(req.user._id, postId);

  return res.status(200).json(
    new ApiResponse(200, "Post unsaved successfully.", {
      saved: false,
    }),
  );
});

const checkSavedPostController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;

  const saved = await checkSavedPost(req.user._id, postId);

  return res.status(200).json(
    new ApiResponse(200, "Save status fetched successfully.", {
      saved,
    }),
  );
});

const getSavedPostsController = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedData.query;

  const result = await getSavedPosts(req.user._id, page, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, "Saved posts fetched successfully.", result));
});

export {
  savePostController,
  unsavePostController,
  checkSavedPostController,
  getSavedPostsController,
};
