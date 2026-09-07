import mongoose from "mongoose";

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    participantOne: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participantTwo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index(
  {
    participantOne: 1,
    participantTwo: 1,
  },
  {
    unique: true,
  },
);

conversationSchema.index({
  participantOne: 1,
  updatedAt: -1,
});

conversationSchema.index({
  participantTwo: 1,
  updatedAt: -1,
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
