import { z } from "zod";
import mongoose from "mongoose";

const createFollowSchema = z.object({
  body: z.object({}),

  params: z.object({
    userId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid user ID."),
  }),

  query: z.object({}),
});

const getFollowersSchema = z.object({
  body: z.object({}),

  params: z.object({
    userId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid user ID."),
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

const getFollowingSchema = z.object({
  body: z.object({}),

  params: z.object({
    userId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid user ID."),
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

export { createFollowSchema, getFollowersSchema, getFollowingSchema };
