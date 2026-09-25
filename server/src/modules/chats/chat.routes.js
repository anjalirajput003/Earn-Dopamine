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

router.get("/", verifyJWT, getUserConversationsController);

//create conversation
router.post(
  "/:otherUserId",
  verifyJWT,
  validate(createConversationSchema),
  createConversationController,
);

//delete conversation
//delete conversation for current user
router.delete(
  "/:conversationId",
  verifyJWT,
  deleteConversationController,
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
