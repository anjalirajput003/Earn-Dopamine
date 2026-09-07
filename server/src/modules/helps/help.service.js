import Help from "./help.model.js";
import Post from "../posts/post.model.js";
import ApiError from "../../utils/ApiError.js";
import { createNotification } from "../notifications/notification.service.js";

const createHelp = async ({ offererId, postId, message }) => {
  const post = await Post.findById(postId).select("owner").lean();

  if (!post) {
    throw new ApiError(404, "Post not found.");
  }

  if (post.owner.toString() === offererId.toString()) {
    throw new ApiError(400, "You cannot offer help on your own post.");
  }

  const help = await Help.create({
    post: postId,
    offerer: offererId,
    receiver: post.owner,
    message,
  });

  //creating notification for help as well
  await createNotification({
    recipient: post.owner,
    actor: offererId,
    type: "offer_help",
    message: "offered to help with your post.",
    post: postId,
    help: help._id,
  });

  return help;
};

const getReceivedHelp = async ({ userId, page, limit }) => {
  const skip = (page - 1) * limit;

  const filter = {
    receiver: userId,
  };

  const [helpOffers, totalHelpOffers] = await Promise.all([
    Help.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("offerer", "username fullName avatar isVerified")
      .populate("post", "caption")
      .lean(),

    Help.countDocuments(filter),
  ]);

  return {
    helpOffers,
    pagination: {
      page,
      limit,
      totalHelpOffers,
      totalPages: Math.ceil(totalHelpOffers / limit),
      hasNextPage: page < Math.ceil(totalHelpOffers / limit),
      hasPreviousPage: page > 1,
    },
  };
};

const getSentHelp = async ({ userId, page, limit }) => {
  const skip = (page - 1) * limit;

  const filter = {
    offerer: userId,
  };

  const [helpOffers, totalHelpOffers] = await Promise.all([
    Help.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("receiver", "username fullName avatar isVerified")
      .populate("post", "caption")
      .lean(),

    Help.countDocuments(filter),
  ]);

  return {
    helpOffers,
    pagination: {
      page,
      limit,
      totalHelpOffers,
      totalPages: Math.ceil(totalHelpOffers / limit),
      hasNextPage: page < Math.ceil(totalHelpOffers / limit),
      hasPreviousPage: page > 1,
    },
  };
};

const respondToHelp = async ({ helpId, receiverId, status }) => {
 const help = await Help.findOne({
   _id: helpId,
   receiver: receiverId,
 });

 if (!help) {
   throw new ApiError(
     404,
     "Help offer not found or you are not authorized to respond to it.",
   );
 }

  if (help.status !== "pending") {
    throw new ApiError(400, "Only pending help offers can be responded to.");
  }

  help.status = status;
  help.respondedAt = new Date();

  await help.save();

  //creating notification when the help is accepted/declined
  if (status === "accepted") {
    await createNotification({
      recipient: help.offerer,
      actor: receiverId,
      type: "help_accepted",
      message: "accepted your help offer.",
      post: help.post,
      help: help._id,
    });
  }

  if (status === "declined") {
    await createNotification({
      recipient: help.offerer,
      actor: receiverId,
      type: "help_declined",
      message: "declined your help offer.",
      post: help.post,
      help: help._id,
    });
  }
  return help;
};

const completeHelp = async ({ helpId, receiverId }) => {
  const help = await Help.findOne({
    _id: helpId,
    receiver: receiverId,
  });

  if (!help) {
    throw new ApiError(
      404,
      "Help offer not found or you are not authorized to complete it.",
    );
  }

  if (help.status !== "accepted") {
    throw new ApiError(400, "Only accepted help offers can be completed.");
  }

  help.status = "completed";
  help.completedAt = new Date();

  await help.save();

  //creating notification when the help is completed
  await createNotification({
    recipient: help.offerer,
    actor: receiverId,
    type: "help_completed",
    message: "marked your help offer as completed.",
    post: help.post,
    help: help._id,
  });

  return help;
};

export { createHelp, getReceivedHelp, getSentHelp, respondToHelp, completeHelp };
