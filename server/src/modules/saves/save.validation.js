import mongoose from "mongoose";
import { z } from "zod";

const postIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID.");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const savePostSchema = z.object({
  body: z.object({}),
  params: z.object({
    postId: postIdSchema,
  }),
  query: z.object({}),
});

const getSavedPostsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: paginationSchema,
});

export { savePostSchema, getSavedPostsSchema };
