import asyncHandler from "../../utils/asyncHandler.js";

import ApiResponse from "../../utils/ApiResponse.js";

import { getOrCreateConversation, getUserConversations } from "./chat.service.js";

const createConversationController = asyncHandler(async (req, res) => {
  const { otherUserId } = req.validatedData.params;

  const conversation = await getOrCreateConversation({
    userId: req.user._id,
    otherUserId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Conversation fetched successfully.",
        conversation,
      ),
    );
});

const getUserConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getUserConversations({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Conversations fetched successfully.",
        conversations,
      ),
    );
});

export { createConversationController, getUserConversationsController };