// import { Router } from "express";

// import verifyJWT from "../../middlewares/auth.middleware.js";
// import validate from "../../middlewares/validate.middleware.js";

// import {
//   createFollowController,
//   getFollowersController,
//   getFollowingController,
//   deleteFollowController,
//   getFollowCountsController
// } from "./follow.controller.js";
// import {
//   createFollowSchema,
//   getFollowersSchema,
//   getFollowingSchema,
// } from "./follow.validation.js";

// const router = Router();

// router.post(
//   "/:userId",
//   verifyJWT,
//   validate(createFollowSchema),
//   createFollowController,
// );

// router.get(
//   "/:userId/followers",
//   verifyJWT,
//   validate(getFollowersSchema),
//   getFollowersController,
// );

// router.get(
//   "/:userId/following",
//   verifyJWT,
//   validate(getFollowingSchema),
//   getFollowingController,
// );

// router.delete(
//   "/:userId",
//   verifyJWT,
//   validate(createFollowSchema),
//   deleteFollowController,
// );

// router.get(
//   "/:userId/counts",
//   verifyJWT,
//   validate(createFollowSchema),
//   getFollowCountsController,
// );

// export default router;









import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createFollowController,
  getFollowersController,
  getFollowingController,
  deleteFollowController,
  getFollowCountsController,
  checkFollowStatusController,
} from "./follow.controller.js";

import {
  createFollowSchema,
  getFollowersSchema,
  getFollowingSchema,
} from "./follow.validation.js";

const router = Router();

router.post(
  "/:userId",
  verifyJWT,
  validate(createFollowSchema),
  createFollowController,
);

router.get(
  "/:userId/followers",
  verifyJWT,
  validate(getFollowersSchema),
  getFollowersController,
);

router.get(
  "/:userId/following",
  verifyJWT,
  validate(getFollowingSchema),
  getFollowingController,
);

router.delete(
  "/:userId",
  verifyJWT,
  validate(createFollowSchema),
  deleteFollowController,
);

router.get(
  "/:userId/counts",
  verifyJWT,
  validate(createFollowSchema),
  getFollowCountsController,
);

router.get(
  "/:userId/status",
  verifyJWT,
  validate(createFollowSchema),
  checkFollowStatusController,
);

export default router;
