import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { createConversationController } from "./chat.controller.js";
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

//create conversation
router.post(
  "/:otherUserId",
  verifyJWT,
  validate(createConversationSchema),
  createConversationController,
);

//send message
router.post(
  "/:conversationId/messages",
  verifyJWT,
  validate(sendMessageSchema),
  sendMessageController,
);

//get messages
router.get(
  "/:conversationId/messages",
  verifyJWT,
  validate(getMessagesSchema),
  getMessagesController,
);

//mark message as read
router.patch(
  "/:conversationId/messages/read",
  verifyJWT,
  validate(markMessagesAsReadSchema),
  markMessagesAsReadController,
);

export default router;
