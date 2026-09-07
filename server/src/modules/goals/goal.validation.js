import { z } from "zod";
import mongoose from "mongoose";

// create goal validator
const createGoalSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Goal title is required.")
        .max(200, "Goal title cannot exceed 200 characters."),

      description: z
        .string()
        .trim()
        .max(2000, "Goal description cannot exceed 2000 characters.")
        .default(""),

      category: z
        .string()
        .trim()
        .max(100, "Goal category cannot exceed 100 characters.")
        .default(""),

      startDate: z.coerce.date({
        error: "Start date is required.",
      }),

      deadline: z.coerce.date({
        error: "Deadline is required.",
      }),
    })
    .strict()
    .refine((data) => data.deadline >= data.startDate, {
      path: ["deadline"],
      message: "Deadline cannot be before the start date.",
    }),

  params: z.object({}),

  query: z.object({}),
});

// get goals validator
const getGoalsSchema = z.object({
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

//get a single goal validator
const getGoalSchema = z.object({
  body: z.object({}),

  params: z.object({
    goalId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid goal ID."),
  }),

  query: z.object({}),
});

//goal progressPercentage
const updateGoalProgressSchema = z.object({
  body: z
    .object({
      progress: z.coerce
        .number()
        .min(0, "Progress cannot be less than 0.")
        .max(100, "Progress cannot exceed 100."),
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

//delete goal
const deleteGoalSchema = z.object({
  body: z.object({}),

  params: z.object({
    goalId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid goal ID."),
  }),

  query: z.object({}),
});

const updateGoalSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Goal title is required.")
        .max(200, "Goal title cannot exceed 200 characters.")
        .optional(),

      description: z
        .string()
        .trim()
        .max(2000, "Goal description cannot exceed 2000 characters.")
        .optional(),

      category: z
        .string()
        .trim()
        .max(100, "Goal category cannot exceed 100 characters.")
        .optional(),

      startDate: z.coerce.date().optional(),

      deadline: z.coerce.date().optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.startDate === undefined ||
        data.deadline === undefined ||
        data.deadline >= data.startDate,
      {
        path: ["deadline"],
        message: "Deadline cannot be before the start date.",
      },
    ),

  params: z.object({
    goalId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid goal ID."),
  }),

  query: z.object({}),
});

export {
  createGoalSchema,
  getGoalsSchema,
  getGoalSchema,
  updateGoalProgressSchema,
  deleteGoalSchema,
  updateGoalSchema,
  };
