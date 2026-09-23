import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";

import validate from "../../middlewares/validate.middleware.js";

import {
  createStudyRoomSchema,
  studyRoomIdSchema,
} from "./studyRoom.validation.js";

import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  getMyRooms,
  deleteRoom,
  discoverRooms,
} from "./studyRoom.controller.js";

import {
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  getCurrentSession,
  getStudyStats,
  getParticipantSessions,
} from "./studySession.controller.js";

import { studySessionSchema } from "./studySession.validation.js";

const router = Router();

// create study room

router.post("/", verifyJWT, validate(createStudyRoomSchema), createRoom);

router.get("/", verifyJWT, getMyRooms);

router.get("/discover", verifyJWT, discoverRooms);

// get study room

router.get("/:roomId", verifyJWT, validate(studyRoomIdSchema), getRoom);

router.delete("/:roomId", verifyJWT, validate(studyRoomIdSchema), deleteRoom);

// join study room

router.post("/:roomId/join", verifyJWT, validate(studyRoomIdSchema), joinRoom);

// leave study room

router.post(
  "/:roomId/leave",
  verifyJWT,
  validate(studyRoomIdSchema),
  leaveRoom,
);

// start study session

router.post(
  "/:roomId/session/start",
  verifyJWT,
  validate(studySessionSchema),
  startSession,
);

// pause study session

router.post(
  "/:roomId/session/pause",
  verifyJWT,
  validate(studySessionSchema),
  pauseSession,
);

// resume study session

router.post(
  "/:roomId/session/resume",
  verifyJWT,
  validate(studySessionSchema),
  resumeSession,
);

// stop study session

router.post(
  "/:roomId/session/stop",
  verifyJWT,
  validate(studySessionSchema),
  stopSession,
);

// get current study session

router.get(
  "/:roomId/session/current",
  verifyJWT,
  validate(studySessionSchema),
  getCurrentSession,
);

// get participant study sessions
router.get(
  "/:roomId/session/participants",
  verifyJWT,
  validate(studySessionSchema),
  getParticipantSessions,
);

// get study statistics
router.get(
  "/:roomId/stats",
  verifyJWT,
  validate(studySessionSchema),
  getStudyStats,
);

export default router;
