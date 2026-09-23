import {
  updateProfile,
  updateAvatar,
  updateCoverImage,
  getUserByUsername,
  searchUsers,
  checkUsernameAvailability,
} from "../../modules/users/user.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const updateUserProfile = asyncHandler(async (req, res) => {
  const updatedUser = await updateProfile(req.user._id, req.validatedData.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully.", updatedUser));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const updatedUser = await updateAvatar(req.user._id, req.file);

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully.", updatedUser));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const updatedUser = await updateCoverImage(req.user._id, req.file);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Cover image updated successfully.", updatedUser),
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await getUserByUsername(username);

  return res
    .status(200)
    .json(new ApiResponse(200, "User profile fetched successfully.", user));
});

const searchAllUsers = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.validatedData.query;

  const result = await searchUsers({
    q,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully.", result));
});

const checkUsername = asyncHandler(async (req, res) => {
  const { username } = req.validatedData.query;

  const available = await checkUsernameAvailability(username);

  return res.status(200).json(
    new ApiResponse(
      200,
      available ? "Username is available." : "Username is already taken.",
      {
        available,
      },
    ),
  );
});

export {
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage,
  getUserProfile,
  searchAllUsers,
  checkUsername,
};
