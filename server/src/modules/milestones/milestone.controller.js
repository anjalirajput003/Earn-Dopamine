import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createMilestone,
  getMilestones,
  updateMilestone,
  completeMilestone,
  deleteMilestone
} from "./milestone.service.js";

const createMilestoneController = asyncHandler(async (req, res) => {
  const { goalId } = req.validatedData.params;

  const { title, description, order } = req.validatedData.body;

  const milestone = await createMilestone({
    userId: req.user._id,
    goalId,
    title,
    description,
    order,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, milestone, "Milestone created successfully."));
});

const getMilestonesController = asyncHandler(async (req, res) => {
  const { goalId } = req.validatedData.params;

  const milestones = await getMilestones({
    userId: req.user._id,
    goalId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, milestones, "Milestones fetched successfully."));
});

const updateMilestoneController = asyncHandler(async (req, res) => {
  const { milestoneId } = req.validatedData.params;

  const { title, description, order } = req.validatedData.body;

  const milestone = await updateMilestone({
    userId: req.user._id,
    milestoneId,
    title,
    description,
    order,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Milestone updated successfully.", milestone));
});

const completeMilestoneController = asyncHandler(async (req, res) => {
  const { milestoneId } = req.validatedData.params;

  const milestone = await completeMilestone({
    userId: req.user._id,
    milestoneId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Milestone completed successfully.", milestone));
});

const deleteMilestoneController = asyncHandler(async (req, res) => {
  const { milestoneId } = req.validatedData.params;

  await deleteMilestone({
    userId: req.user._id,
    milestoneId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Milestone deleted successfully.", null));
});

export {
  createMilestoneController,
  getMilestonesController,
  updateMilestoneController,
  completeMilestoneController,
  deleteMilestoneController
};
