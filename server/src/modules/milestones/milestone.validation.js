import { z } from "zod";
import mongoose from "mongoose";

// create milestone validator
const createMilestoneSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Milestone title is required.")
        .max(200, "Milestone title cannot exceed 200 characters."),

      description: z
        .string()
        .trim()
        .max(1000, "Milestone description cannot exceed 1000 characters.")
        .default(""),

      order: z.coerce
        .number()
        .int("Order must be an integer.")
        .min(0, "Order cannot be negative.")
        .default(0),
    })
    .strict(),

  params: z.object({
    goalId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid goal ID."),
  }),

  query: z.object({}),
});

// get milestones validator
const getMilestonesSchema = z.object({
  body: z.object({}),

  params: z.object({
    goalId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid goal ID."),
  }),

  query: z.object({}),
});

const updateMilestoneSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Milestone title is required.")
        .max(200, "Milestone title cannot exceed 200 characters.")
        .optional(),

      description: z
        .string()
        .trim()
        .max(1000, "Milestone description cannot exceed 1000 characters.")
        .optional(),

      order: z.coerce
        .number()
        .int("Order must be an integer.")
        .min(0, "Order cannot be negative.")
        .optional(),
    })
    .strict(),

  params: z.object({
    milestoneId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid milestone ID.",
      ),
  }),

  query: z.object({}),
});

const updateMilestoneStatusSchema = z.object({
  body: z.object({}),

  params: z.object({
    milestoneId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid milestone ID.",
      ),
  }),

  query: z.object({}),
});

const deleteMilestoneSchema = z.object({
  body: z.object({}),

  params: z.object({
    milestoneId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid milestone ID.",
      ),
  }),

  query: z.object({}),
});

export {
  createMilestoneSchema,
  getMilestonesSchema,
  updateMilestoneSchema,
  updateMilestoneStatusSchema,
  deleteMilestoneSchema,
};
