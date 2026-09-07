import { z } from "zod";
import mongoose from "mongoose";

// create help offer
const createHelpSchema = z.object({
  body: z
    .object({
      message: z
        .string()
        .trim()
        .max(500, "Help message cannot exceed 500 characters.")
        .default(""),
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

const getReceivedHelpSchema = z.object({
  params: z.object({}),

  body: z.object({}),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

const getSentHelpSchema = z.object({
  params: z.object({}),

  body: z.object({}),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

const respondToHelpSchema = z.object({
  params: z.object({
    helpId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid help offer ID.",
      ),
  }),

  body: z
    .object({
      status: z.enum(["accepted", "declined"]),
    })
    .strict(),

  query: z.object({}),
});

const completeHelpSchema = z.object({
  params: z.object({
    helpId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid help offer ID.",
      ),
  }),

  body: z.object({}),

  query: z.object({}),
});

export {
  createHelpSchema,
  getReceivedHelpSchema,
  getSentHelpSchema,
  respondToHelpSchema,
  completeHelpSchema
};
