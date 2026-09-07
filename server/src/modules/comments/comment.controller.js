import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import { createComment, getComments, deleteComment } from "./comment.service.js";

const createCommentController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;
  const { content } = req.validatedData.body;

  const comment = await createComment({
    userId: req.user._id,
    postId,
    content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully."));
});

const getCommentsController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;
  const { page, limit } = req.validatedData.query;

  const result = await getComments({
    postId,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully."));
});

const deleteCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.validatedData.params;

  await deleteComment({
    userId: req.user._id,
    commentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully."));
});

export { createCommentController, getCommentsController, deleteCommentController };
