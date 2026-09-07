import { z } from "zod";
import mongoose from "mongoose";

const createStudyRoomSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Study room name cannot be empty.")
        .max(100, "Study room name cannot exceed 100 characters."),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});

const studyRoomIdSchema = z.object({
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

export { createStudyRoomSchema, studyRoomIdSchema };
