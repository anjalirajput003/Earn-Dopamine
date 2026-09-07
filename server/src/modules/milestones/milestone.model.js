import mongoose from "mongoose";

const { Schema } = mongoose;

const milestoneSchema = new Schema(
  {
    goal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },

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
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    order: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

milestoneSchema.index({
  goal: 1,
  order: 1,
});

milestoneSchema.index({
  goal: 1,
  createdAt: -1,
});

const Milestone = mongoose.model("Milestone", milestoneSchema);

export default Milestone;
