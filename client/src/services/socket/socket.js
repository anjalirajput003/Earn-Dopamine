import { io } from "socket.io-client";
import { getAccessToken } from "../../services/api/axios";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export const connectSocket = () => {
  socket.auth = {
    token: getAccessToken(),
  };

  socket.connect();
};
