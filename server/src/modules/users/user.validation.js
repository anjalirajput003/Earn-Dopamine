import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters long.")
  .max(30, "Username cannot exceed 30 characters.")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores.",
  );

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters.")
      .max(50, "Full name cannot exceed 50 characters.")
      .optional(),

    bio: z
      .string()
      .trim()
      .max(250, "Bio cannot exceed 250 characters.")
      .optional(),

    website: z
      .string()
      .trim()
      .url("Please provide a valid website URL.")
      .optional()
      .or(z.literal("")),

    interests: z.array(z.string().trim()).optional(),

    productivityGoals: z.array(z.string().trim()).optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

//username validation
const getUserByUsernameSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    username: usernameSchema,
  }),
});

//SEARCH SCHEMA
const searchUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    q: z.string().trim().min(1, "Search query is required."),

    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().min(1).max(20).default(10),
  }),
});

//checking username
const checkUsernameSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    username: usernameSchema,
  }),
});

export {
  updateProfileSchema,
  getUserByUsernameSchema,
  searchUsersSchema,
  checkUsernameSchema,
};
