import ApiError from "../utils/ApiError.js";

import asyncHandler from "../utils/asyncHandler.js";

import { verifyAccessToken } from "../utils/auth.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""); // this part is for when a request comes from postman or thundeClient there would be no cookies but the authorization so we are just removing Bearer to get only the token

  if (!token) {
    throw new ApiError(401, "Unauthorized request.");
  }

  const user = await verifyAccessToken(token);

  req.user = user;

  next();
});

export default verifyJWT;
