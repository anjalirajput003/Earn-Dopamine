import { z } from "zod";

const registerSchema = z.object({
  body: z.object({
      username: z
        .string()
        .trim()
        .min(3, "Username must contain at least 3 characters.")
        .max(30, "Username cannot exceed 30 characters.")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username can only contain letters, numbers, and underscores.",
        )
        .transform((value) => value.toLowerCase()),

      email: z
        .email("Please provide a valid email address.")
        .trim()
        .toLowerCase(),

      password: z
        .string()
        .min(8, "Password must contain at least 8 characters.")
        .max(72, "Password cannot exceed 72 characters."),

      fullName: z
        .string()
        .trim()
        .min(1, "Full name is required.")
        .max(50, "Full name cannot exceed 50 characters."),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});

const loginSchema = z.object({
  body: z.object({
      email: z
        .email("Please provide a valid email address.")
        .trim()
        .toLowerCase(),

      password: z.string().min(1, "Password is required."),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});


export { loginSchema, registerSchema};
