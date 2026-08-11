import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/env.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""); // this part is for when a request comes from postman or thundeClient there would be no cookies but the authorization so we are just removing Bearer to get only the token

  if (!token) {
    throw new ApiError(401, "Unauthorized request.");
  }

  const decodedToken = jwt.verify(token, env.accessTokenSecret);

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new ApiError(401, "Invalid access token.");
  }

  req.user = user; //we are adding this new property in our middleware like req = {body, params, cookies, user} so after this users can do req.user instead of writing the whole authentication for userId

  next();
});

export default verifyJWT;
