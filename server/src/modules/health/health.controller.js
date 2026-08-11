import mongoose from "mongoose";

import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const getHealthStatus = asyncHandler(async (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  const statusCode = databaseConnected ? 200 : 503;

  const message = databaseConnected
    ? "Earn Dopamine API is healthy."
    : "Earn Dopamine API is unavailable.";

  res.status(statusCode).json(
    new ApiResponse(statusCode, message, {
      services: {
        database: databaseConnected ? "connected" : "disconnected",
      },
    }),
  );
});

export { getHealthStatus };
