import StudyRoom from "./studyRoom.model.js";
import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";

const createStudyRoom = async ({ userId, name }) => {
  const userExists = await User.exists({ _id: userId });

  if (!userExists) {
    throw new ApiError(404, "User not found.");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new ApiError(400, "Study room name cannot be empty.");
  }

  const studyRoom = await StudyRoom.create({
    name: trimmedName,
    creator: userId,
    participants: [userId],
  });

  return studyRoom;
};

const getStudyRoom = async ({ userId, roomId }) => {
  const studyRoom = await StudyRoom.findById(roomId)
    .populate("creator", "username fullName avatar isVerified")
    .populate("participants", "username fullName avatar isVerified")
    .lean();

  if (!studyRoom) {
    throw new ApiError(404, "Study room not found.");
  }

  return studyRoom;
};

const joinStudyRoom = async ({ userId, roomId }) => {
  const studyRoom = await StudyRoom.findById(roomId);

  if (!studyRoom) {
    throw new ApiError(404, "Study room not found.");
  }

  const alreadyParticipant = studyRoom.participants.some(
    (participantId) => participantId.toString() === userId.toString(),
  );

  if (alreadyParticipant) {
    return studyRoom;
  }

  studyRoom.participants.push(userId);

  await studyRoom.save();

  return studyRoom;
};

const leaveStudyRoom = async ({ userId, roomId }) => {
  const studyRoom = await StudyRoom.findById(roomId);

  if (!studyRoom) {
    throw new ApiError(404, "Study room not found.");
  }

  const isParticipant = studyRoom.participants.some(
    (participantId) => participantId.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(400, "You are not a participant of this study room.");
  }

  if (studyRoom.creator.toString() === userId.toString()) {
    throw new ApiError(400, "The room creator cannot leave the study room.");
  }

  studyRoom.participants = studyRoom.participants.filter(
    (participantId) => participantId.toString() !== userId.toString(),
  );

  await studyRoom.save();

  return studyRoom;
};

const getMyStudyRooms = async ({ userId }) => {
  const studyRooms = await StudyRoom.find({
    participants: userId,
  })
    .populate("creator", "username fullName avatar isVerified")
    .populate("participants", "username fullName avatar isVerified")
    .sort({ createdAt: -1 })
    .lean();

  return studyRooms;
};

const getDiscoverableStudyRooms = async ({ userId }) => {
  const studyRooms = await StudyRoom.find({
    participants: { $ne: userId },
  })
    .populate("creator", "username fullName avatar isVerified")
    .populate("participants", "username fullName avatar isVerified")
    .sort({ createdAt: -1 })
    .lean();

  return studyRooms;
};

const deleteStudyRoom = async ({ userId, roomId }) => {
  const studyRoom = await StudyRoom.findById(roomId);

  if (!studyRoom) {
    throw new ApiError(404, "Study room not found.");
  }

  if (studyRoom.creator.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the room creator can delete the study room.");
  }

  await StudyRoom.findByIdAndDelete(roomId);

  return studyRoom;
};

export {
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  getMyStudyRooms,
  deleteStudyRoom,
  getDiscoverableStudyRooms
};
