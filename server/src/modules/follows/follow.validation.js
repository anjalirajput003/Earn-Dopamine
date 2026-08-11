import mongoose from "mongoose";
import { z } from "zod";

const followUserSchema = z.object({
  body: z.object({}),

  params: z.object({
    userId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid user ID."),
  }),

  query: z.object({}),
});

export { followUserSchema };
