import mongoose from "mongoose";

const { Schema } = mongoose;

const studyRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

studyRoomSchema.index({ creator: 1, createdAt: -1 });
studyRoomSchema.index({ participants: 1 });

const StudyRoom = mongoose.model("StudyRoom", studyRoomSchema);

export default StudyRoom;
