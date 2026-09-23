import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  checkSavedPostController,
  getSavedPostsController,
  savePostController,
  unsavePostController,
} from "./save.controller.js";

import { getSavedPostsSchema, savePostSchema } from "./save.validation.js";

const router = Router();

router.get(
  "/",
  verifyJWT,
  validate(getSavedPostsSchema),
  getSavedPostsController,
);

router.post(
  "/:postId",
  verifyJWT,
  validate(savePostSchema),
  savePostController,
);

router.delete(
  "/:postId",
  verifyJWT,
  validate(savePostSchema),
  unsavePostController,
);

router.get(
  "/:postId",
  verifyJWT,
  validate(savePostSchema),
  checkSavedPostController,
);

export default router;
