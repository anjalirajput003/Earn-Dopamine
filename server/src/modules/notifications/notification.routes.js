import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  getNotificationsController,
  markNotificationAsReadController,
  getUnreadNotificationCountController,
  markAllNotificationsAsReadController
} from "./notification.controller.js";

import {
  getNotificationsSchema,
  markNotificationAsReadSchema,
} from "./notification.validation.js";

const router = Router();

router.get(
  "/",
  verifyJWT,
  validate(getNotificationsSchema),
  getNotificationsController,
);

router.get("/unread-count", verifyJWT, getUnreadNotificationCountController);

router.patch("/read-all", verifyJWT, markAllNotificationsAsReadController);

router.patch(
  "/:notificationId/read",
  verifyJWT,
  validate(markNotificationAsReadSchema),
  markNotificationAsReadController,
);

export default router;
