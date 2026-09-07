import { z } from "zod";
import mongoose from "mongoose";

const getNotificationsSchema = z.object({
  params: z.object({}),

  body: z.object({}),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

const markNotificationAsReadSchema = z.object({
  params: z.object({
    notificationId: z
      .string()
      .trim()
      .refine(
        (value) => mongoose.isValidObjectId(value),
        "Invalid notification ID.",
      ),
  }),

  body: z.object({}),

  query: z.object({}),
});

export { getNotificationsSchema, markNotificationAsReadSchema };
