// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";

// import { addNotification } from "../../features/notifications/notificationSlice";
// import { socket, connectSocket } from "../../services/socket/socket";

// const SocketProvider = ({ children }) => {
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth.user);

//   useEffect(() => {
//     if (!user?._id) {
//       if (socket.connected) {
//         socket.disconnect();
//       }

//       return;
//     }

//     const handleNewNotification = (notification) => {
//       dispatch(addNotification(notification));
//     };

//     socket.on("notification:new", handleNewNotification);

//     if (!socket.connected) {
//       connectSocket();
//     }

//     return () => {
//       socket.off("notification:new", handleNewNotification);
//       socket.disconnect();
//     };
//   }, [dispatch, user?._id]);

//   return children;
// };

// export default SocketProvider;

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

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);
    };

    const handleDisconnect = (reason) => {
      console.warn("Socket disconnected:", reason);
    };

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("notification:new", handleNewNotification);

    if (!socket.connected) {
      connectSocket();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("notification:new", handleNewNotification);

      socket.disconnect();
    };
  }, [dispatch, user?._id]);

  return children;
};

export default SocketProvider;