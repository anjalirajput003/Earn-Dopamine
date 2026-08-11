import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import { follow, unfollow } from "./follow.controller.js";

import { followUserSchema } from "./follow.validation.js";

const router = Router();

router.post("/:userId/follow", verifyJWT, validate(followUserSchema), follow);

router.delete(
  "/:userId/follow",
  verifyJWT,
  validate(followUserSchema),
  unfollow,
);

export default router;
