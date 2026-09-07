import mongoose from "mongoose";

import Message from "./message.model.js";
import Conversation from "./conversation.model.js";

import ApiError from "../../utils/ApiError.js";

const sendMessage = async ({ userId, conversationId, content }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID.");
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new ApiError(400, "Message cannot be empty.");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    $or: [{ participantOne: userId }, { participantTwo: userId }],
  });

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found or you are not a participant.",
    );
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content: trimmedContent,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    updatedAt: new Date(),
  });

  return message;
};

const getMessages = async ({ userId, conversationId, page, limit }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    $or: [{ participantOne: userId }, { participantTwo: userId }],
  });

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found or you are not a participant.",
    );
  }

  const skip = (page - 1) * limit;

  const filter = {
    conversation: conversationId,
  };

  const [messages, totalMessages] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username fullName avatar isVerified")
      .lean(),

    Message.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalMessages / limit);

  return {
    messages,
    pagination: {
      page,
      limit,
      totalMessages,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const markMessagesAsRead = async ({ userId, conversationId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    $or: [{ participantOne: userId }, { participantTwo: userId }],
  });

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found or you are not a participant.",
    );
  }

  const result = await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

export { sendMessage, getMessages, markMessagesAsRead };
