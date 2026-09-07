import asyncHandler from "../../utils/asyncHandler.js";

import ApiResponse from "../../utils/ApiResponse.js";

import { getOrCreateConversation } from "./chat.service.js";

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

export { createConversationController };