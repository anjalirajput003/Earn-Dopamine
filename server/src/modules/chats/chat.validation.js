import { z } from "zod";
import mongoose from "mongoose";

const conversationIdSchema = z
  .string()
  .trim()
  .refine(
    (value) => mongoose.isValidObjectId(value),
    "Invalid conversation ID.",
  );

const contentSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty.")
  .max(2000, "Message cannot exceed 2000 characters.");

const createConversationSchema = z.object({
  body: z.object({}),
  params: z.object({
    otherUserId: z
      .string()
      .trim()
      .refine((value) => mongoose.isValidObjectId(value), "Invalid user ID."),
  }),
  query: z.object({}),
});

const sendMessageSchema = z.object({
  body: z
    .object({
      content: contentSchema,
    })
    .strict(),
  params: z.object({
    conversationId: conversationIdSchema,
  }),
  query: z.object({}),
});

const getMessagesSchema = z.object({
  body: z.object({}),
  params: z.object({
    conversationId: conversationIdSchema,
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

const markMessagesAsReadSchema = z.object({
  body: z.object({}),
  params: z.object({
    conversationId: conversationIdSchema,
  }),
  query: z.object({}),
});

const sendMessageSocketSchema = z
  .object({
    conversationId: conversationIdSchema,
    content: contentSchema,
  })
  .strict();

export {
  createConversationSchema,
  sendMessageSchema,
  getMessagesSchema,
  markMessagesAsReadSchema,
  sendMessageSocketSchema,
};

















// import { z } from "zod";
// import mongoose from "mongoose";

// const createConversationSchema = z.object({
//   body: z.object({}),

//   params: z.object({
//     otherUserId: z
//       .string()
//       .trim()
//       .refine((value) => mongoose.isValidObjectId(value), "Invalid user ID."),
//   }),

//   query: z.object({}),
// });

// const sendMessageSchema = z.object({
//   body: z
//     .object({
//       content: z
//         .string()
//         .trim()
//         .min(1, "Message cannot be empty.")
//         .max(2000, "Message cannot exceed 2000 characters."),
//     })
//     .strict(),

//   params: z.object({
//     conversationId: z
//       .string()
//       .trim()
//       .refine(
//         (value) => mongoose.isValidObjectId(value),
//         "Invalid conversation ID.",
//       ),
//   }),

//   query: z.object({}),
// });

// const getMessagesSchema = z.object({
//   body: z.object({}),

//   params: z.object({
//     conversationId: z
//       .string()
//       .trim()
//       .refine(
//         (value) => mongoose.isValidObjectId(value),
//         "Invalid conversation ID.",
//       ),
//   }),

//   query: z.object({
//     page: z.coerce.number().int().positive().default(1),
//     limit: z.coerce.number().int().min(1).max(50).default(20),
//   }),
// });

// const markMessagesAsReadSchema = z.object({
//   body: z.object({}),

//   params: z.object({
//     conversationId: z
//       .string()
//       .trim()
//       .refine(
//         (value) => mongoose.isValidObjectId(value),
//         "Invalid conversation ID.",
//       ),
//   }),

//   query: z.object({}),
// });

// //this is the validation for the send message socket event because socket.io events bypasses express validation middleware because they dont knoe about each other
// const sendMessageSocketSchema = z
//   .object({
//     conversationId: z
//       .string()
//       .trim()
//       .refine(
//         (value) => mongoose.isValidObjectId(value),
//         "Invalid conversation ID.",
//       ),
//     content: z
//       .string()
//       .trim()
//       .min(1, "Message cannot be empty.")
//       .max(2000, "Message cannot exceed 2000 characters."),
//   })
//   .strict();

// export {
//   createConversationSchema,
//   sendMessageSchema,
//   getMessagesSchema,
//   markMessagesAsReadSchema,
//   sendMessageSocketSchema
// };
