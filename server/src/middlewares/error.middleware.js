import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import multer from "multer";

const errorMiddleware = (error, req, res, next) => {
  let normalizedError = error;

  //mongo duplicate key error
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern ?? {})[0];

    normalizedError = new ApiError(
      409,
      duplicateField
        ? `A user with this ${duplicateField} already exists.`
        : "A user with the provided information already exists.",
    );
  }

  //jwt error
  if (
    error.name === "TokenExpiredError" ||
    error.name === "JsonWebTokenError"
  ) {
    normalizedError = new ApiError(401, "Invalid or expired access token.");
  }

  // Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      normalizedError = new ApiError(400, "Image size cannot exceed 5 MB.");
    } else {
      normalizedError = new ApiError(400, error.message);
    }
  }

  const statusCode = normalizedError.statusCode || 500;
  const message = normalizedError.message || "Internal server error.";

  const errorResponse = {
    success: false,
    statusCode,
    message,
    errors: normalizedError.errors || [],
  };

  if (env.nodeEnv === "development") {
    errorResponse.stack = normalizedError.stack;
  }

  return res.status(statusCode).json(errorResponse);
};;

export default errorMiddleware;
