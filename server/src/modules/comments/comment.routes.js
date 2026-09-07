import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createCommentController,
  getCommentsController,
  deleteCommentController
} from "./comment.controller.js";

import {
  createCommentSchema,
  getCommentsSchema,
  deleteCommentSchema
} from "./comment.validation.js";

const router = Router();

// create comment
router.post(
  "/:postId",
  verifyJWT,
  validate(createCommentSchema),
  createCommentController,
);

// get comments
router.get(
  "/:postId",
  verifyJWT,
  validate(getCommentsSchema),
  getCommentsController,
);

// delete comment
router.delete(
  "/:commentId",
  verifyJWT,
  validate(deleteCommentSchema),
  deleteCommentController,
);

export default router;
