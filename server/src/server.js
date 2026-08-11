import "dotenv/config";

import { createServer } from "node:http";

import app from "./app.js";
import env from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

const httpServer = createServer(app);

let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(env.port, () => {
      console.log(
        `Earn Dopamine server running in ${env.nodeEnv} mode on port ${env.port}`,
      );
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown.`);

  httpServer.close(async (serverError) => {
    if (serverError) {
      console.error("Error while closing the HTTP server:", serverError);

      process.exit(1);
    }

    try {
      await disconnectDatabase();

      console.log("Graceful shutdown completed successfully.");

      process.exit(0);
    } catch (databaseError) {
      console.error(
        "Error while closing the database connection:",
        databaseError,
      );

      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

void startServer();
