import mongoose from "mongoose";

const { Schema } = mongoose;

const studySessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: "StudyRoom",
      required: true,
      index: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    resumedAt: {
      type: Date,
      default: null,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    accumulatedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

studySessionSchema.index({ user: 1, room: 1, createdAt: -1 });
studySessionSchema.index({ user: 1, status: 1 });
studySessionSchema.index({ room: 1, status: 1 });

const StudySession = mongoose.model("StudySession", studySessionSchema);

export default StudySession;
