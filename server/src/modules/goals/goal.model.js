import mongoose from "mongoose";

const { Schema } = mongoose;

const goalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    currentProgress: {
      type: Number,
      default: 0,
      min: 0,
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["not_started", "active", "paused", "completed", "abandoned"],
      default: "not_started",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

goalSchema.index({
  user: 1,
  createdAt: -1,
});

goalSchema.index({
  user: 1,
  status: 1, 
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
