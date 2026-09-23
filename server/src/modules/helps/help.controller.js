import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createHelp,
  getReceivedHelp,
  getSentHelp,
  respondToHelp,
  completeHelp
} from "./help.service.js";

const createHelpController = asyncHandler(async (req, res) => {
  const { postId } = req.validatedData.params;
  const { message } = req.validatedData.body;

  const help = await createHelp({
    offererId: req.user._id,
    postId,
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Help offered successfully.", help));
});

const getReceivedHelpController = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedData.query;

  const result = await getReceivedHelp({
    userId: req.user._id,
    page,
    limit,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Received help offers fetched successfully.",
        result,
      ),
    );
});

const getSentHelpController = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedData.query;

  const result = await getSentHelp({
    userId: req.user._id,
    page,
    limit,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Sent help offers fetched successfully.", result),
    );
});

const respondToHelpController = asyncHandler(async (req, res) => {
  const { helpId } = req.validatedData.params;
  const { status } = req.validatedData.body;

  const help = await respondToHelp({
    helpId,
    receiverId: req.user._id,
    status,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, `Help offer ${status} successfully.`, help));
});

const completeHelpController = asyncHandler(async (req, res) => {
  const { helpId } = req.validatedData.params;

  const help = await completeHelp({
    helpId,
    receiverId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Help completed successfully.", help));
});

export {
  createHelpController,
  getReceivedHelpController,
  getSentHelpController,
  respondToHelpController,
  completeHelpController
};
