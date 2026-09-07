// import "dotenv/config";

// import { io } from "socket.io-client";

// const token = process.env.TEST_ACCESS_TOKEN;

// if (!token) {
//   throw new Error("TEST_ACCESS_TOKEN is required.");
// }

// const socket = io("http://localhost:5000", {
//   auth: {
//     token,
//   },
// });

// socket.on("connect", () => {
//   console.log("Socket connected successfully.");
//   console.log("Socket ID:", socket.id);
//   socket.emit(
//     "chat:message",
//     {
//       conversationId: "6a9720608d369f79cf7a3f83",
//       content: "hey",
//     },
//     (response) => {
//       console.log("Chat acknowledgement received:");
//       console.log(response);
//     },
//   );
// });

// socket.on("chat:message", (message) => {
//   console.log("Real-time chat message received:");
//   console.log(message);
// });

// socket.on("chat:error", (error) => {
//   console.error("Chat error received:");
//   console.error(error);
// });

// socket.emit(
//   "study-room:join",
//   {
//     roomId: "6a9d6491bbea67382804455e",
//   },
//   (response) => {
//     console.log("Study room join acknowledgement received:");
//     console.log(response);
//   },
// );

// socket.on("study-room:presence", (data) => {
//   console.log("Study room presence event received:");
//   console.log(data);
// });

// socket.on("study-session:updated", (data) => {
//   console.log("Study session update received:");
//   console.log(data);
// });

// socket.emit(
//   "study-session:start",
//   {
//     roomId: "6a9d6491bbea67382804455e",
//   },
//   (response) => {
//     console.log("Study session start acknowledgement received:");
//     console.log(response);
//   },
// );

// socket.emit(
//   "study-session:pause",
//   {
//     roomId: "6a9d6491bbea67382804455e",
//   },
//   (response) => {
//     console.log("Study session pause acknowledgement received:");
//     console.log(response);
//   },
// );

// socket.emit(
//   "study-session:resume",
//   {
//     roomId: "6a9d6491bbea67382804455e",
//   },
//   (response) => {
//     console.log("Study session resume acknowledgement received:");
//     console.log(response);
//   },
// );

// socket.emit(
//   "study-session:stop",
//   {
//     roomId: "6a9d6491bbea67382804455e",
//   },
//   (response) => {
//     console.log("Study session stop acknowledgement received:");
//     console.log(response);
//   },
// );

// socket.on("notification:new", (notification) => {
//   console.log("Real-time notification received:");
//   console.log(notification);
// });

// socket.on("connect_error", (error) => {
//   console.error("Socket connection failed:", error.message);
// });

// socket.on("disconnect", (reason) => {
//   console.log("Socket disconnected:", reason);
// });

// });

import "dotenv/config";

import { io } from "socket.io-client";

const token = process.argv[2];
const studyRoomId = process.argv[3];

if (!token) {
  throw new Error("Access token is required.");
}

if (!studyRoomId) {
  throw new Error("Study room ID is required.");
}

const socket = io("http://localhost:5000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("Socket connected successfully.");
  console.log("Socket ID:", socket.id);

  console.log("\nJoining study room...");

  socket.emit(
    "study-room:join",
    {
      roomId: studyRoomId,
    },
    (response) => {
      console.log("Join acknowledgement:");
      console.log(response);

      if (!response.success) {
        console.log("Failed to join study room.");
        socket.disconnect();
        return;
      }

      console.log("\nSuccessfully joined study room.");
      console.log("Type one of these commands:");
      console.log("start");
      console.log("pause");
      console.log("resume");
      console.log("stop");
    },
  );
});

socket.on("study-room:presence", (data) => {
  console.log("\nStudy room presence received:");
  console.log(data);
});

socket.on("study-session:updated", (data) => {
  console.log("\nStudy session update received:");
  console.log(data);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection failed:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("\nSocket disconnected:", reason);
});

process.stdin.setEncoding("utf8");

process.stdin.on("data", (input) => {
  const command = input.trim();

  if (command === "start") {
    console.log("\nStarting study session...");

    socket.emit(
      "study-session:start",
      {
        roomId: studyRoomId,
      },
      (response) => {
        console.log("Start acknowledgement:");
        console.log(response);
      },
    );
  }

  if (command === "pause") {
    console.log("\nPausing study session...");

    socket.emit(
      "study-session:pause",
      {
        roomId: studyRoomId,
      },
      (response) => {
        console.log("Pause acknowledgement:");
        console.log(response);
      },
    );
  }

  if (command === "resume") {
    console.log("\nResuming study session...");

    socket.emit(
      "study-session:resume",
      {
        roomId: studyRoomId,
      },
      (response) => {
        console.log("Resume acknowledgement:");
        console.log(response);
      },
    );
  }

  if (command === "stop") {
    console.log("\nStopping study session...");

    socket.emit(
      "study-session:stop",
      {
        roomId: studyRoomId,
      },
      (response) => {
        console.log("Stop acknowledgement:");
        console.log(response);
      },
    );
  }
});