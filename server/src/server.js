import "dotenv/config";

import { createServer } from "node:http";

import app from "./app.js";
import env from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { Server } from "socket.io";
import authenticateSocket from "./socket/socket.auth.js";
import { initializeSocket } from "./socket/socket.server.js";
import initializeChatSocket from "./modules/chats/chat.socket.js";
import initializeStudyRoomSocket from "./modules/studyRooms/studyRoom.socket.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

initializeSocket(io);

//this socket io middleware will authenticate the socket before a connection is accepted
io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log(`Socket connected for user: ${socket.user._id}`);

  socket.join(`user:${socket.user._id}`);

  initializeChatSocket(socket);
  initializeStudyRoomSocket(socket);

  console.log("User rooms:", Array.from(socket.rooms));

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected for user: ${socket.user._id}`, reason);
  });
});

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
