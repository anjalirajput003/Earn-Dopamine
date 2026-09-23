import { z } from "zod";
import mongoose from "mongoose";

// create cheer validator
const createCheerSchema = z.object({
  body: z.object({}),

  params: z.object({
    postId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID."),
  }),

  query: z.object({}),
});

// remove cheer validator
const removeCheerSchema = z.object({
  body: z.object({}),

  params: z.object({
    postId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID."),
  }),

  query: z.object({}),
});

const checkCheerStatusSchema = z.object({
  body: z.object({}),
  params: z.object({
    postId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID."),
  }),
  query: z.object({}),
});

export { createCheerSchema, removeCheerSchema, checkCheerStatusSchema };
