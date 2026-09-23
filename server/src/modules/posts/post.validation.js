import { z } from "zod";
import mongoose from "mongoose";

//post validator
const createPostSchema = z.object({
  body: z
    .object({
      caption: z
        .string()
        .trim()
        .max(2200, "Caption cannot exceed 2200 characters.")
        .optional()
        .default(""),

      visibility: z.enum(["public", "followers", "private"]).default("public"),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});

const getPostSchema = z.object({
  body: z.object({}),

  params: z.object({
    postId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID."),
  }),

  query: z.object({}),
});

const getUserPostsSchema = z.object({
  body: z.object({}),

  params: z.object({
    username: z.string().trim().min(1, "Username is required."),
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

const deletePostSchema = z.object({
  body: z.object({}),
  params: z.object({
    postId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid post ID."),
  }),
  query: z.object({}),
});

//feed validator
const getFeedSchema = z.object({
  body: z.object({}),

  params: z.object({}),

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

export {
  createPostSchema,
  getFeedSchema,
  getPostSchema,
  getUserPostsSchema,
  deletePostSchema,
};
