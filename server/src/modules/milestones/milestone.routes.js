import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createMilestoneController,
  getMilestonesController,
  updateMilestoneController,
  completeMilestoneController,
  deleteMilestoneController
} from "./milestone.controller.js";

import {
  createMilestoneSchema,
  getMilestonesSchema,
  updateMilestoneSchema,
  updateMilestoneStatusSchema,
  deleteMilestoneSchema
} from "./milestone.validation.js";

const router = Router();

// create milestone for a goal
router.post(
  "/:goalId",
  verifyJWT,
  validate(createMilestoneSchema),
  createMilestoneController,
);

// get milestones for a goal
router.get(
  "/:goalId",
  verifyJWT,
  validate(getMilestonesSchema),
  getMilestonesController,
);

// update milestone
router.patch(
  "/:milestoneId",
  verifyJWT,
  validate(updateMilestoneSchema),
  updateMilestoneController,
);

// complete milestone
router.patch(
  "/:milestoneId/complete",
  verifyJWT,
  validate(updateMilestoneStatusSchema),
  completeMilestoneController,
);

// delete milestone
router.delete(
  "/:milestoneId",
  verifyJWT,
  validate(deleteMilestoneSchema),
  deleteMilestoneController,
);

export default router;
