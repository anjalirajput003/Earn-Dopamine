import { verifyAccessToken } from "../utils/auth.js";

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    const user = await verifyAccessToken(token);

    socket.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticateSocket;
