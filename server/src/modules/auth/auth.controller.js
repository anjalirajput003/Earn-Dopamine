import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "./auth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import env from "../../config/env.js";

const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.validatedData.body);
  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully.", user));
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(
    req.validatedData.body,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".onrender.com",
  };

  return res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200)
    .json(new ApiResponse(200, "Logged in successfully.", { user }));
});

const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".onrender.com",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, "Logged out successfully.", null));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessToken(incomingRefreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".onrender.com",
  };

  return res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(new ApiResponse(200, "Access token refreshed successfully.", null));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully.", user));
});

export { login, register, logout, refreshToken, getMe };
