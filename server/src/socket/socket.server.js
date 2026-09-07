let io;

const initializeSocket = (socketServer) => {
  io = socketServer;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

export { initializeSocket, getIO };
