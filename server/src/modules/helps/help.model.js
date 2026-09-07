import mongoose from "mongoose";

const { Schema } = mongoose;

const helpSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    offerer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },

    respondedAt: {
      type: Date,
      default: null,
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

helpSchema.index({
  post: 1,
  createdAt: -1,
});

helpSchema.index({
  receiver: 1,
  status: 1,
  createdAt: -1,
});

helpSchema.index({
  offerer: 1,
  createdAt: -1,
});

const Help = mongoose.model("Help", helpSchema);

export default Help;
