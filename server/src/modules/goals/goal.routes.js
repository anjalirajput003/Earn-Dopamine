import { Router } from "express";

import verifyJWT from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import { createGoalController, getGoalsController, getGoalController, updateGoalProgressController, deleteGoalController, updateGoalController } from "./goal.controller.js";

import { createGoalSchema, getGoalsSchema, getGoalSchema, updateGoalProgressSchema, deleteGoalSchema, updateGoalSchema } from "./goal.validation.js";

const router = Router();

// create goal
router.post("/", verifyJWT, validate(createGoalSchema), createGoalController);

// get my goals
router.get("/", verifyJWT, validate(getGoalsSchema), getGoalsController);

//get a single goal
router.get("/:goalId", verifyJWT, validate(getGoalSchema), getGoalController);

// update goal progress
router.patch(
  "/:goalId/progress",
  verifyJWT,
  validate(updateGoalProgressSchema),
  updateGoalProgressController,
);

// delete goal
router.delete(
  "/:goalId",
  verifyJWT,
  validate(deleteGoalSchema),
  deleteGoalController,
);

// update goal details
router.patch(
  "/:goalId",
  verifyJWT,
  validate(updateGoalSchema),
  updateGoalController,
);

export default router;
