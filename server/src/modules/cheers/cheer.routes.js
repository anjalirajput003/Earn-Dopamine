import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createCheerController,
  removeCheerController,
} from "./cheer.controller.js";

import { createCheerSchema, removeCheerSchema } from "./cheer.validation.js";

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

export default router;
