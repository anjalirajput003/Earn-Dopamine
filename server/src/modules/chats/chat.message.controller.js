import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import { sendMessage, getMessages, markMessagesAsRead } from "./chat.message.service.js";

const sendMessageController = asyncHandler(async (req, res) => {
  const { conversationId } = req.validatedData.params;
  const { content } = req.validatedData.body;

  const message = await sendMessage({
    userId: req.user._id,
    conversationId,
    content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent successfully.", message));
});

const getMessagesController = asyncHandler(async (req, res) => {
  const { conversationId } = req.validatedData.params;
  const { page, limit } = req.validatedData.query;

  const messages = await getMessages({
    userId: req.user._id,
    conversationId,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Messages fetched successfully.", messages));
});

const markMessagesAsReadController = asyncHandler(async (req, res) => {
  const { conversationId } = req.validatedData.params;

  const result = await markMessagesAsRead({
    userId: req.user._id,
    conversationId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Messages marked as read successfully.", result),
    );
});

export { sendMessageController, getMessagesController, markMessagesAsReadController };
