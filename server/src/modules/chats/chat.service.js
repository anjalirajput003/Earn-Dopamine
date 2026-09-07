import mongoose from "mongoose";

import Conversation from "./conversation.model.js";

import User from "../users/user.model.js";

import ApiError from "../../utils/ApiError.js";

const getOrCreateConversation = async ({ userId, otherUserId }) => {
  if (userId.toString() === otherUserId.toString()) {
    throw new ApiError(400, "You cannot create a conversation with yourself.");
  }

  const otherUserExists = await User.exists({
    _id: otherUserId,
  });

  if (!otherUserExists) {
    throw new ApiError(404, "User not found.");
  }

  const [participantOne, participantTwo] = [
    userId.toString(),
    otherUserId.toString(),
  ].sort();

  let conversation = await Conversation.findOne({
    participantOne,
    participantTwo,
  });

  if (conversation) {
    return conversation;
  }

  try {
    conversation = await Conversation.create({
      participantOne,
      participantTwo,
    });
  } catch (error) {
    if (
      error instanceof mongoose.Error &&
      error.name === "MongoServerError" &&
      error.code === 11000
    ) {
      conversation = await Conversation.findOne({
        participantOne,
        participantTwo,
      });
    } else {
      throw error;
    }
  }

  return conversation;
};

export { getOrCreateConversation };
