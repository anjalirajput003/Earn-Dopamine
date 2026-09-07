import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "./notification.service.js";

const getNotificationsController = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedData.query;

  const result = await getNotifications({
    userId: req.user._id,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Notifications fetched successfully."));
});

const markNotificationAsReadController = asyncHandler(async (req, res) => {
  const { notificationId } = req.validatedData.params;

  const notification = await markNotificationAsRead({
    notificationId,
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        "Notification marked as read successfully.",
      ),
    );
});

const getUnreadNotificationCountController = asyncHandler(async (req, res) => {
  const result = await getUnreadNotificationCount({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Unread notification count fetched successfully.",
      ),
    );
});

const markAllNotificationsAsReadController = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsAsRead({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "All notifications marked as read successfully.",
      ),
    );
});

export {
  getNotificationsController,
  markNotificationAsReadController,
  getUnreadNotificationCountController,
  markAllNotificationsAsReadController,
};
