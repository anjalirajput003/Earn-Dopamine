import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import postUpload from "../../middlewares/post-upload.middleware.js";
import validatePostMedia from "../../middlewares/validate-post-media.middleware.js";

import {
  createPost,
  getFeed,
  getPost,
  getUserPostsController,
  deletePost,
} from "./post.controller.js";
import {
  createPostSchema,
  getFeedSchema,
  getPostSchema,
  getUserPostsSchema,
  deletePostSchema,
} from "./post.validation.js";

const router = Router();

//post route
router.post(
  "/",
  verifyJWT,
  postUpload.array("media", 10),
  validate(createPostSchema),
  validatePostMedia,
  createPost,
);

//feed route
router.get("/feed", verifyJWT, validate(getFeedSchema), getFeed);

router.get(
  "/user/:username",
  verifyJWT,
  validate(getUserPostsSchema),
  getUserPostsController,
);

router.delete("/:postId", verifyJWT, validate(deletePostSchema), deletePost);

router.get("/:postId", verifyJWT, validate(getPostSchema), getPost);

export default router;
