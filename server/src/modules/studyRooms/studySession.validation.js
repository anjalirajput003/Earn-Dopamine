import { z } from "zod";
import mongoose from "mongoose";

const studySessionSchema = z.object({
  body: z.object({}),

  params: z.object({
    roomId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid study room ID.",
      ),
  }),

  query: z.object({}),
});

export { studySessionSchema };
