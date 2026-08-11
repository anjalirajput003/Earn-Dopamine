import mongoose from "mongoose";

import env from "./env.js";

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(env.mongodbUri);

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`,
    );

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

const disconnectDatabase = async () => {
  await mongoose.connection.close();

  console.log("MongoDB connection closed successfully.");
};

export { connectDatabase, disconnectDatabase };
