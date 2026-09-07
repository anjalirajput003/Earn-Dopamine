import { z } from "zod";
import mongoose from "mongoose";

// create comment validator
const createCommentSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .trim()
        .min(1, "Comment cannot be empty.")
        .max(2000, "Comment cannot exceed 2000 characters."),
    })
    .strict(),

  params: z.object({
    postId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID."),
  }),

  query: z.object({}),
});

// get comments validator
const getCommentsSchema = z.object({
  body: z.object({}),

  params: z.object({
    postId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID."),
  }),

  query: z.object({
    page: z.coerce
      .number()
      .int("Page must be an integer.")
      .min(1, "Page must be at least 1.")
      .default(1),

    limit: z.coerce
      .number()
      .int("Limit must be an integer.")
      .min(1, "Limit must be at least 1.")
      .max(50, "Limit cannot exceed 50.")
      .default(10),
  }),
});

// delete comment validator
const deleteCommentSchema = z.object({
  body: z.object({}),

  params: z.object({
    commentId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid comment ID.",
      ),
  }),

  query: z.object({}),
});

export { createCommentSchema, getCommentsSchema, deleteCommentSchema };
