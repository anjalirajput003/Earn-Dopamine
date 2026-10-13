import mongoose from "mongoose";
import mediaSchema from "../../schemas/media.schema.js";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 2200,
      default: "",
    },

    media: {
      type: [mediaSchema],
      default: [],
    },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },

    cheersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({
  owner: 1,
  createdAt: -1,
});

postSchema.index({
  visibility: 1,
  createdAt: -1,
});

const Post = mongoose.model("Post", postSchema);

export default Post;
