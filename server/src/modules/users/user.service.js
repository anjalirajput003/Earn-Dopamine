import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";
import { CLOUDINARY_FOLDERS } from "../../constants/cloudinary.js";

const PUBLIC_USER_FIELDS = `
  username
  fullName
  bio
  avatar
  coverImage
  website
  interests
  productivityGoals
  isVerified
  createdAt
`;

const updateProfile = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found.");
  }

  return await User.findById(updatedUser._id);
};

//private helper for avatar and cover image upload
const updateUserImage = async (userId, file, imageField, folder) => {
  if (!file) {
    throw new ApiError(400, `${imageField} image is required.`);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const uploadedImage = await uploadToCloudinary(file.buffer, folder);

  const oldPublicId = user[imageField]?.publicId;

  user[imageField] = {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
  };

  await user.save();

  await deleteFromCloudinary(oldPublicId);

  return await User.findById(user._id);
};

const updateAvatar = async (userId, file) => {
  return await updateUserImage(
    userId,
    file,
    "avatar",
    CLOUDINARY_FOLDERS.AVATARS,
  );
};

const updateCoverImage = async (userId, file) => {
  return await updateUserImage(
    userId,
    file,
    "coverImage",
    CLOUDINARY_FOLDERS.COVERS,
  );
};

const getUserByUsername = async (username) => {
  const user = await User.findOne({
    username: username.toLowerCase(),
  }).select(PUBLIC_USER_FIELDS);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

const searchUsers = async ({ q, page, limit }) => {
  const skip = (page - 1) * limit;

  const searchFilter = {
    $or: [
      {
        username: {
          $regex: q,
          $options: "i",
        },
      },
      {
        fullName: {
          $regex: q,
          $options: "i",
        },
      },
    ],
  };

  const [users, totalUsers] = await Promise.all([
    User.find(searchFilter)
      .select(PUBLIC_USER_FIELDS)
      .sort({ username: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(searchFilter),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const checkUsernameAvailability = async (username) => {
  const userExists = await User.exists({
    username: username.toLowerCase(),
  });

  return !userExists;
};

export { updateProfile, updateAvatar, updateCoverImage, getUserByUsername, searchUsers, checkUsernameAvailability };
