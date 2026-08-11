import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";

const registerUser = async ({ username, email, password, fullName }) => {
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "A user with this email or username already exists.",
    );
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
  });

  return User.findById(user._id);
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password); //the isPasswordCorrect function is the bcrypt compare method we wrote in the user model file so we are giving that function our password and it goes directly to the user model file and the function executes and the password comparison is done....

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const accessToken = user.generateAccessToken();

  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();

  await user.save();

  const safeUser = await User.findById(user._id);

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $unset: {
      refreshToken: 1,
    },
  });
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request.");
  }

  const decodedToken = jwt.verify(incomingRefreshToken, env.refreshTokenSecret);

  const user = await User.findById(decodedToken.userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or revoked.");
  }

  const accessToken = user.generateAccessToken();

  const refreshToken = user.generateRefreshToken(); //we are generating a refresh token again because it would be more secure to generate again instead of using the same refresh token indefinitely and this process is called Refresh Token Rotation...

  user.refreshToken = refreshToken;

  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

const getCurrentUser = async (userId) => {
  return await User.findById(userId);
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
};
