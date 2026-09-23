import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  checkCheerStatusController,
  createCheerController,
  removeCheerController,
} from "./cheer.controller.js";

import {
  checkCheerStatusSchema,
  createCheerSchema,
  removeCheerSchema,
} from "./cheer.validation.js";

const router = Router();

// create cheer
router.post(
  "/:postId",
  verifyJWT,
  validate(createCheerSchema),
  createCheerController,
);

// remove cheer
router.delete(
  "/:postId",
  verifyJWT,
  validate(removeCheerSchema),
  removeCheerController,
);

// check whether the current user has cheered the post
router.get(
  "/:postId",
  verifyJWT,
  validate(checkCheerStatusSchema),
  checkCheerStatusController,
);

export default router;
