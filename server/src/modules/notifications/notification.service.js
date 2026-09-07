import Notification from "./notification.model.js";
import ApiError from "../../utils/ApiError.js";
import { getIO } from "../../socket/socket.server.js";

const createNotification = async ({
  recipient,
  actor,
  type,
  message,
  post = null,
  help = null,
}) => {
  const notification = await Notification.create({
    recipient,
    actor,
    type,
    message,
    post,
    help,
  });

  const io = getIO();

  io.to(`user:${recipient.toString()}`).emit("notification:new", notification);

  return notification;
};

const getNotifications = async ({ userId, page, limit }) => {
  const skip = (page - 1) * limit;

  const filter = {
    recipient: userId,
  };

  const [notifications, totalNotifications] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actor", "username fullName avatar isVerified")
      .populate("post", "caption")
      .lean(),

    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      totalNotifications,
      totalPages: Math.ceil(totalNotifications / limit),
      hasNextPage: page < Math.ceil(totalNotifications / limit),
      hasPreviousPage: page > 1,
    },
  };
};

const markNotificationAsRead = async ({ notificationId, userId }) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found or you are not authorized to modify it.",
    );
  }

  if (notification.isRead) {
    return notification;
  }

  notification.isRead = true;
  notification.readAt = new Date();

  await notification.save();

  return notification;
};

const getUnreadNotificationCount = async ({ userId }) => {
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return {
    unreadCount,
  };
};

const markAllNotificationsAsRead = async ({ userId }) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
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

export {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
};
