import { getIO } from "../../socket/socket.server.js";
import Conversation from "./conversation.model.js";
import { sendMessage } from "./chat.message.service.js";
import { sendMessageSocketSchema } from "./chat.validation.js";

const initializeChatSocket = (socket) => {
  socket.on("chat:message", async (payload, acknowledge) => {
    try {
      const result = sendMessageSocketSchema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        acknowledge?.({
          success: false,
          message: "Request validation failed.",
          errors,
        });

        return;
      }

      const { conversationId, content } = result.data;

      const message = await sendMessage({
        userId: socket.user._id,
        conversationId,
        content,
      });

      const conversation = await Conversation.findById(conversationId)
        .select("participantOne participantTwo")
        .lean();

      if (!conversation) {
        return;
      }

      const io = getIO();

      io.to(`user:${conversation.participantOne.toString()}`).emit(
        "chat:message",
        message,
      );

      io.to(`user:${conversation.participantTwo.toString()}`).emit(
        "chat:message",
        message,
      );

      acknowledge?.({
        success: true,
        message: "Message sent successfully.",
        data: message,
      });

    } catch (error) {
      acknowledge?.({
        success: false,
        message: error.message || "Failed to send message.",
      });
    }
  });
};

export default initializeChatSocket;
