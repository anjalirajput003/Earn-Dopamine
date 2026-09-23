import mongoose from "mongoose";

import Conversation from "./conversation.model.js";

import User from "../users/user.model.js";

import ApiError from "../../utils/ApiError.js";
import Message from "./message.model.js";

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

const getUserConversations = async ({ userId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const conversations = await Conversation.find({
    $or: [{ participantOne: userId }, { participantTwo: userId }],
  })
    .sort({ updatedAt: -1 })
    .populate("participantOne", "username fullName avatar isVerified")
    .populate("participantTwo", "username fullName avatar isVerified")
    .lean();

  const result = await Promise.all(
    conversations.map(async (conversation) => {
      const isParticipantOne =
        conversation.participantOne._id.toString() === userId.toString();

      const otherUser = isParticipantOne
        ? conversation.participantTwo
        : conversation.participantOne;

      const [lastMessage, unreadCount] = await Promise.all([
        Message.findOne({
          conversation: conversation._id,
        })
          .sort({ createdAt: -1 })
          .select("sender content createdAt isRead")
          .lean(),

        Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          isRead: false,
        }),
      ]);

      return {
        _id: conversation._id,
        otherUser,
        lastMessage,
        unreadCount,
        updatedAt: conversation.updatedAt,
      };
    }),
  );

  return result;
};

export { getOrCreateConversation, getUserConversations };
