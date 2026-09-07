import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  stopStudySession,
  getCurrentStudySession,
  getStudyStatistics
} from "./studySession.service.js";

const startSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await startStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, session, "Study session started successfully."));
});

const pauseSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await pauseStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, session, "Study session paused successfully."));
});

const resumeSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await resumeStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, session, "Study session resumed successfully."));
});

const stopSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await stopStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, session, "Study session stopped successfully."));
});

const getCurrentSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await getCurrentStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        session,
        "Current study session fetched successfully.",
      ),
    );
});

const getStudyStats = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const statistics = await getStudyStatistics({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        statistics,
        "Study statistics fetched successfully.",
      ),
    );
});

export {
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  getCurrentSession,
  getStudyStats
};
