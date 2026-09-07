import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
} from "./studyRoom.service.js";

const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.validatedData.body;

  const studyRoom = await createStudyRoom({
    userId: req.user._id,
    name,
  });

  res
    .status(201)
    .json(new ApiResponse(201, studyRoom, "Study room created successfully."));
});

const getRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const studyRoom = await getStudyRoom({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, studyRoom, "Study room fetched successfully."));
});

const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const studyRoom = await joinStudyRoom({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, studyRoom, "Joined study room successfully."));
});

const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const studyRoom = await leaveStudyRoom({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, studyRoom, "Left study room successfully."));
});

export { createRoom, getRoom, joinRoom, leaveRoom };
