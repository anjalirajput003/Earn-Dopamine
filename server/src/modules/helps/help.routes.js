import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createHelpController,
  getReceivedHelpController,
  getSentHelpController,
  respondToHelpController,
  completeHelpController
} from "./help.controller.js";
import {
  createHelpSchema,
  getReceivedHelpSchema,
  getSentHelpSchema,
  respondToHelpSchema,
  completeHelpSchema
} from "./help.validation.js";

const router = Router();

// offer help on a post
router.post(
  "/:postId",
  verifyJWT,
  validate(createHelpSchema),
  createHelpController,
);

//get received help
router.get(
  "/received",
  verifyJWT,
  validate(getReceivedHelpSchema),
  getReceivedHelpController,
);

//get sent help
router.get(
  "/sent",
  verifyJWT,
  validate(getSentHelpSchema),
  getSentHelpController,
);

// respond to help
router.patch(
  "/:helpId/respond",
  verifyJWT,
  validate(respondToHelpSchema),
  respondToHelpController,
);

//complete help request
router.patch(
  "/:helpId/complete",
  verifyJWT,
  validate(completeHelpSchema),
  completeHelpController,
);

export default router;
