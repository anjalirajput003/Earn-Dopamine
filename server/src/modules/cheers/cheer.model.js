import mongoose from "mongoose";

const { Schema } = mongoose;

const cheerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// A user can cheer a particular post only once.
cheerSchema.index(
  {
    user: 1,
    post: 1,
  },
  {
    unique: true,
  },
);

// Useful when fetching all cheers for a post.
cheerSchema.index({
  post: 1,
  createdAt: -1,
});

const Cheer = mongoose.model("Cheer", cheerSchema);

export default Cheer;
