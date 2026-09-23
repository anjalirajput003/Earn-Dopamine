import mongoose from "mongoose";

const { Schema } = mongoose;

const saveSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

saveSchema.index(
  {
    user: 1,
    post: 1,
  },
  {
    unique: true,
  },
);

saveSchema.index({
  user: 1,
  createdAt: -1,
});

const Save = mongoose.model("Save", saveSchema);

export default Save;
