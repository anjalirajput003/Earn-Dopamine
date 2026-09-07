import jwt from "jsonwebtoken";

import User from "../modules/users/user.model.js";

import ApiError from "./ApiError.js";

import env from "../config/env.js";

const verifyAccessToken = async (token) => {
  if (!token) {
    throw new ApiError(401, "Unauthorized request.");
  }

  const decodedToken = jwt.verify(token, env.accessTokenSecret);

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new ApiError(401, "Invalid access token.");
  }

  return user;
};

export { verifyAccessToken };
