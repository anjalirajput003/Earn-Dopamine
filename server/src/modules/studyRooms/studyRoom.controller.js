import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  getMyStudyRooms,
  deleteStudyRoom,
  getDiscoverableStudyRooms,
} from "./studyRoom.service.js";

const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.validatedData.body;

  const studyRoom = await createStudyRoom({
    userId: req.user._id,
    name,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Study room created successfully.", studyRoom));
});

const getRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const studyRoom = await getStudyRoom({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Study room fetched successfully.", studyRoom));
});

const getMyRooms = asyncHandler(async (req, res) => {
  const studyRooms = await getMyStudyRooms({
    userId: req.user._id,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Study rooms fetched successfully.", studyRooms),
    );
});

const discoverRooms = asyncHandler(async (req, res) => {
  const studyRooms = await getDiscoverableStudyRooms({
    userId: req.user._id,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Study rooms fetched successfully.", studyRooms),
    );
});

const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const studyRoom = await joinStudyRoom({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Joined study room successfully.", studyRoom));
});

const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const studyRoom = await leaveStudyRoom({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Left study room successfully.", studyRoom));
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  await deleteStudyRoom({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Study room deleted successfully."));
});

export {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  getMyRooms,
  deleteRoom,
  discoverRooms,
};
