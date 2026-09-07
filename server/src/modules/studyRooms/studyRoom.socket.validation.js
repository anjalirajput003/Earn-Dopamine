import { z } from "zod";
import mongoose from "mongoose";

const studyRoomSocketSchema = z.object({
  roomId: z
    .string()
    .trim()
    .refine(
      (value) => mongoose.isValidObjectId(value),
      "Invalid study room ID.",
    ),
});

export { studyRoomSocketSchema };
