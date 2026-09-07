import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createGoal,
  getGoals,
  getGoal,
  updateGoalProgress,
  deleteGoal,
  updateGoal
} from "./goal.service.js";

const createGoalController = asyncHandler(async (req, res) => {
  const { title, description, category, startDate, deadline } =
    req.validatedData.body;

  const goal = await createGoal({
    userId: req.user._id,
    title,
    description,
    category,
    startDate,
    deadline,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Goal created successfully.", goal));
});

const getGoalsController = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedData.query;

  const result = await getGoals({
    userId: req.user._id,
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Goals fetched successfully.", result));
});

// a single goal controller
const getGoalController = asyncHandler(async (req, res) => {
  const { goalId } = req.validatedData.params;

  const goal = await getGoal({
    userId: req.user._id,
    goalId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Goal fetched successfully.", goal));
});

const updateGoalProgressController = asyncHandler(async (req, res) => {
  const { goalId } = req.validatedData.params;
  const { progress } = req.validatedData.body;

  const goal = await updateGoalProgress({
    userId: req.user._id,
    goalId,
    progress,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Goal progress updated successfully.", goal));
});

const deleteGoalController = asyncHandler(async (req, res) => {
  const { goalId } = req.validatedData.params;

  await deleteGoal({
    userId: req.user._id,
    goalId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Goal deleted successfully.", null));
});

const updateGoalController = asyncHandler(async (req, res) => {
  const { goalId } = req.validatedData.params;

  const { title, description, category, startDate, deadline } =
    req.validatedData.body;

  const goal = await updateGoal({
    userId: req.user._id,
    goalId,
    title,
    description,
    category,
    startDate,
    deadline,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Goal updated successfully.", goal));
});

export {
  createGoalController,
  getGoalsController,
  getGoalController,
  updateGoalProgressController,
  deleteGoalController,
  updateGoalController
};
