import { verifyAccessToken } from "../utils/auth.js";

const parseCookies = (cookieHeader = "") => {
  return Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [name, ...valueParts] = cookie.trim().split("=");

      return [name, decodeURIComponent(valueParts.join("="))];
    }),
  );
};

const authenticateSocket = async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie || "");

    const token = cookies.accessToken;

    const user = await verifyAccessToken(token);

    socket.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticateSocket;
