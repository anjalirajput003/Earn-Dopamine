import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  stopStudySession,
  getCurrentStudySession,
  getStudyStatistics,
  getParticipantStudySessions
} from "./studySession.service.js";

const startSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await startStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Study session started successfully.", session));
});

const pauseSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await pauseStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Study session paused successfully.", session));
});

const resumeSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await resumeStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Study session resumed successfully.", session));
});

const stopSession = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const session = await stopStudySession({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Study session stopped successfully.", session));
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
        "Current study session fetched successfully.",
        session,
      ),
    );
});

const getParticipantSessions = asyncHandler(async (req, res) => {
  const { roomId } = req.validatedData.params;

  const sessions = await getParticipantStudySessions({
    userId: req.user._id,
    roomId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Participant study sessions fetched successfully.",
        sessions,
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
        "Study statistics fetched successfully.",
        statistics,
      ),
    );
});

export {
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  getCurrentSession,
  getStudyStats,
  getParticipantSessions
};
