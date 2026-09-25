import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createConversationController,
  getUserConversationsController,
  deleteConversationController,
} from "./chat.controller.js";
import {
  sendMessageController,
  getMessagesController,
  markMessagesAsReadController,
} from "./chat.message.controller.js";

import {
  createConversationSchema,
  sendMessageSchema,
  getMessagesSchema,
  markMessagesAsReadSchema,
} from "./chat.validation.js";

const router = Router();

// Get all (active) conversations
router.get("/", verifyJWT, getUserConversationsController);

// Create conversation
router.post(
  "/:otherUserId",
  verifyJWT,
  validate(createConversationSchema),
  createConversationController,
);

// Delete conversation
router.delete("/:conversationId", verifyJWT, deleteConversationController);

// Send message
router.post(
  "/:conversationId/messages",
  verifyJWT,
  validate(sendMessageSchema),
  sendMessageController,
);

// Get messages
router.get(
  "/:conversationId/messages",
  verifyJWT,
  validate(getMessagesSchema),
  getMessagesController,
);

// Mark message as read
router.patch(
  "/:conversationId/messages/read",
  verifyJWT,
  validate(markMessagesAsReadSchema),
  markMessagesAsReadController,
);

export default router;
