import StudyRoom from "./studyRoom.model.js";
import {
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  stopStudySession,
} from "./studySession.service.js";
import { studyRoomSocketSchema } from "./studyRoom.socket.validation.js";

const getSocketRoomName = (roomId) => `study-room:${roomId}`;

const initializeStudyRoomSocket = (socket) => {
  socket.on("study-room:join", async (payload, acknowledge) => {
    try {
      const result = studyRoomSocketSchema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        acknowledge?.({
          success: false,
          message: "Request validation failed.",
          errors,
        });

        return;
      }

      const { roomId } = result.data;

      const room = await StudyRoom.findOne({
        _id: roomId,
        participants: socket.user._id,
      }).lean();

      if (!room) {
        acknowledge?.({
          success: false,
          message: "Study room not found or you are not a participant.",
        });

        return;
      }

      const socketRoom = getSocketRoomName(roomId);

      await socket.join(socketRoom);

      socket.to(socketRoom).emit("study-room:presence", {
        type: "joined",
        userId: socket.user._id.toString(),
      });

      acknowledge?.({
        success: true,
        message: "Joined study room successfully.",
      });
    } catch (error) {
      acknowledge?.({
        success: false,
        message: error.message || "Failed to join study room.",
      });
    }
  });

  socket.on("study-room:leave", async (payload, acknowledge) => {
    try {
      const result = studyRoomSocketSchema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        acknowledge?.({
          success: false,
          message: "Request validation failed.",
          errors,
        });

        return;
      }

      const { roomId } = result.data;
      const socketRoom = getSocketRoomName(roomId);

      await socket.leave(socketRoom);

      socket.to(socketRoom).emit("study-room:presence", {
        type: "left",
        userId: socket.user._id.toString(),
      });

      acknowledge?.({
        success: true,
        message: "Left study room successfully.",
      });
    } catch (error) {
      acknowledge?.({
        success: false,
        message: error.message || "Failed to leave study room.",
      });
    }
  });

  socket.on("study-session:start", async (payload, acknowledge) => {
    try {
      const result = studyRoomSocketSchema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        acknowledge?.({
          success: false,
          message: "Request validation failed.",
          errors,
        });

        return;
      }

      const { roomId } = result.data;

      const session = await startStudySession({
        userId: socket.user._id,
        roomId,
      });

      const socketRoom = getSocketRoomName(roomId);

      socket.to(socketRoom).emit("study-session:updated", {
        userId: socket.user._id.toString(),
        session,
      });

      acknowledge?.({
        success: true,
        message: "Study session started successfully.",
        data: session,
      });
    } catch (error) {
      acknowledge?.({
        success: false,
        message: error.message || "Failed to start study session.",
      });
    }
  });

  socket.on("study-session:pause", async (payload, acknowledge) => {
    try {
      const result = studyRoomSocketSchema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        acknowledge?.({
          success: false,
          message: "Request validation failed.",
          errors,
        });

        return;
      }

      const { roomId } = result.data;

      const session = await pauseStudySession({
        userId: socket.user._id,
        roomId,
      });

      const socketRoom = getSocketRoomName(roomId);

      socket.to(socketRoom).emit("study-session:updated", {
        userId: socket.user._id.toString(),
        session,
      });

      acknowledge?.({
        success: true,
        message: "Study session paused successfully.",
        data: session,
      });
    } catch (error) {
      acknowledge?.({
        success: false,
        message: error.message || "Failed to pause study session.",
      });
    }
  });

  socket.on("study-session:resume", async (payload, acknowledge) => {
    try {
      const result = studyRoomSocketSchema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        acknowledge?.({
          success: false,
          message: "Request validation failed.",
          errors,
        });

        return;
      }

      const { roomId } = result.data;

      const session = await resumeStudySession({
        userId: socket.user._id,
        roomId,
      });

      const socketRoom = getSocketRoomName(roomId);

      socket.to(socketRoom).emit("study-session:updated", {
        userId: socket.user._id.toString(),
        session,
      });

      acknowledge?.({
        success: true,
        message: "Study session resumed successfully.",
        data: session,
      });
    } catch (error) {
      acknowledge?.({
        success: false,
        message: error.message || "Failed to resume study session.",
      });
    }
  });

  socket.on("study-session:stop", async (payload, acknowledge) => {
    try {
      const result = studyRoomSocketSchema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        acknowledge?.({
          success: false,
          message: "Request validation failed.",
          errors,
        });

        return;
      }

      const { roomId } = result.data;

      const session = await stopStudySession({
        userId: socket.user._id,
        roomId,
      });

      const socketRoom = getSocketRoomName(roomId);

      socket.to(socketRoom).emit("study-session:updated", {
        userId: socket.user._id.toString(),
        session,
      });

      acknowledge?.({
        success: true,
        message: "Study session stopped successfully.",
        data: session,
      });
    } catch (error) {
      acknowledge?.({
        success: false,
        message: error.message || "Failed to stop study session.",
      });
    }
  });
};

export default initializeStudyRoomSocket;
