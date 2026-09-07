import mongoose from "mongoose";
import StudyRoom from "./studyRoom.model.js";
import StudySession from "./studySession.model.js";
import ApiError from "../../utils/ApiError.js";

const getParticipantRoom = async ({ userId, roomId }) => {
  const room = await StudyRoom.findOne({
    _id: roomId,
    participants: userId,
  });

  if (!room) {
    throw new ApiError(
      404,
      "Study room not found or you are not a participant.",
    );
  }

  return room;
};

const startStudySession = async ({ userId, roomId }) => {
  await getParticipantRoom({ userId, roomId });

  const existingSession = await StudySession.findOne({
    user: userId,
    room: roomId,
    status: { $in: ["active", "paused"] },
  });

  if (existingSession) {
    throw new ApiError(
      400,
      "You already have an unfinished study session in this room.",
    );
  }

  const now = new Date();

  const session = await StudySession.create({
    user: userId,
    room: roomId,
    startedAt: now,
    resumedAt: now,
    accumulatedSeconds: 0,
    status: "active",
  });

  return session;
};

const pauseStudySession = async ({ userId, roomId }) => {
  await getParticipantRoom({ userId, roomId });

  const session = await StudySession.findOne({
    user: userId,
    room: roomId,
    status: "active",
  });

  if (!session) {
    throw new ApiError(400, "No active study session found.");
  }

  const now = new Date();

  const activeSeconds = Math.floor(
    (now.getTime() - session.resumedAt.getTime()) / 1000,
  );

  session.accumulatedSeconds += Math.max(activeSeconds, 0);
  session.pausedAt = now;
  session.resumedAt = null;
  session.status = "paused";

  await session.save();

  return session;
};

const resumeStudySession = async ({ userId, roomId }) => {
  await getParticipantRoom({ userId, roomId });

  const session = await StudySession.findOne({
    user: userId,
    room: roomId,
    status: "paused",
  });

  if (!session) {
    throw new ApiError(400, "No paused study session found.");
  }

  const now = new Date();

  session.resumedAt = now;
  session.pausedAt = null;
  session.status = "active";

  await session.save();

  return session;
};

const stopStudySession = async ({ userId, roomId }) => {
  await getParticipantRoom({ userId, roomId });

  const session = await StudySession.findOne({
    user: userId,
    room: roomId,
    status: { $in: ["active", "paused"] },
  });

  if (!session) {
    throw new ApiError(400, "No unfinished study session found.");
  }

  const now = new Date();

  if (session.status === "active") {
    const activeSeconds = Math.floor(
      (now.getTime() - session.resumedAt.getTime()) / 1000,
    );

    session.accumulatedSeconds += Math.max(activeSeconds, 0);
  }

  session.endedAt = now;
  session.resumedAt = null;
  session.pausedAt = null;
  session.status = "completed";

  await session.save();

  return session;
};

const getCurrentStudySession = async ({ userId, roomId }) => {
  await getParticipantRoom({ userId, roomId });

  const session = await StudySession.findOne({
    user: userId,
    room: roomId,
    status: { $in: ["active", "paused"] },
  }).lean();

  return session;
};

const getStudyStatistics = async ({ userId, roomId }) => {
  await getParticipantRoom({ userId, roomId });

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const roomObjectId = new mongoose.Types.ObjectId(roomId);

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();

  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const baseQuery = {
    user: userObjectId,
    room: roomObjectId,
    status: "completed",
    endedAt: { $ne: null },
  };
  const [todayResult, weekResult, monthResult] = await Promise.all([
    StudySession.aggregate([
      {
        $match: {
          ...baseQuery,
          endedAt: {
            $gte: startOfToday,
            $lte: now,
          },
        },
      },
      {
        $group: {
          _id: null,
          seconds: {
            $sum: "$accumulatedSeconds",
          },
        },
      },
    ]),

    StudySession.aggregate([
      {
        $match: {
          ...baseQuery,
          endedAt: {
            $gte: startOfWeek,
            $lte: now,
          },
        },
      },
      {
        $group: {
          _id: null,
          seconds: {
            $sum: "$accumulatedSeconds",
          },
        },
      },
    ]),

    StudySession.aggregate([
      {
        $match: {
          ...baseQuery,
          endedAt: {
            $gte: startOfMonth,
            $lte: now,
          },
        },
      },
      {
        $group: {
          _id: null,
          seconds: {
            $sum: "$accumulatedSeconds",
          },
        },
      },
    ]),
  ]);

  const todaySeconds = todayResult[0]?.seconds ?? 0;
  const weekSeconds = weekResult[0]?.seconds ?? 0;
  const monthSeconds = monthResult[0]?.seconds ?? 0;

  return {
    today: {
      seconds: todaySeconds,
      hours: Number((todaySeconds / 3600).toFixed(2)),
    },

    thisWeek: {
      seconds: weekSeconds,
      hours: Number((weekSeconds / 3600).toFixed(2)),
    },

    thisMonth: {
      seconds: monthSeconds,
      hours: Number((monthSeconds / 3600).toFixed(2)),
    },
  };
};

export {
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  stopStudySession,
  getCurrentStudySession,
  getStudyStatistics,
};
