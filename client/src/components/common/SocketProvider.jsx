import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addNotification } from "../../features/notifications/notificationSlice";
import { socket, connectSocket } from "../../services/socket/socket";

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?._id) {
      if (socket.connected) {
        socket.disconnect();
      }

      return;
    }

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    socket.on("notification:new", handleNewNotification);

    if (!socket.connected) {
      connectSocket();
    }

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.disconnect();
    };
  }, [dispatch, user?._id]);

  return children;
};

export default SocketProvider;
