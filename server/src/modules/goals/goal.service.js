import Goal from "./goal.model.js";
import ApiError from "../../utils/ApiError.js";

const createGoal = async ({
  userId,
  title,
  description,
  category,
  startDate,
  deadline,
}) => {
  const goal = await Goal.create({
    user: userId,
    title,
    description,
    category,
    startDate,
    deadline,
  });

  return goal;
};

const getGoals = async ({ userId, page, limit }) => {
  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
  };

  const [goals, totalGoals] = await Promise.all([
    Goal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

    Goal.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalGoals / limit);

  return {
    goals,
    pagination: {
      page,
      limit,
      totalGoals,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// get a single goal
const getGoal = async ({ userId, goalId }) => {
  const goal = await Goal.findOne({
    _id: goalId,
    user: userId,
  }).lean();

  if (!goal) {
    throw new ApiError(404, "Goal not found.");
  }

  return goal;
};

//goal progress update
const updateGoalProgress = async ({ userId, goalId, progress }) => {
  const goal = await Goal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new ApiError(404, "Goal not found.");
  }

  goal.currentProgress = progress;
  goal.progressPercentage = progress;

  if (progress === 0) {
    goal.status = "not_started";
    goal.completedAt = null;
  } else if (progress === 100) {
    goal.status = "completed";
    goal.completedAt = goal.completedAt ?? new Date();
  } else {
    goal.status = "active";
    goal.completedAt = null;
  }

  await goal.save();

  return goal;
};

//delete goal
const deleteGoal = async ({ userId, goalId }) => {
  const goal = await Goal.findOneAndDelete({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new ApiError(404, "Goal not found.");
  }

  return goal;
};

//update goal 
const updateGoal = async ({
  userId,
  goalId,
  title,
  description,
  category,
  startDate,
  deadline,
}) => {
  const goal = await Goal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new ApiError(404, "Goal not found.");
  }

  const nextStartDate = startDate ?? goal.startDate;
  const nextDeadline = deadline ?? goal.deadline;

  if (nextDeadline < nextStartDate) {
    throw new ApiError(400, "Deadline cannot be before the start date.");
  }

  if (title !== undefined) {
    goal.title = title;
  }

  if (description !== undefined) {
    goal.description = description;
  }

  if (category !== undefined) {
    goal.category = category;
  }

  if (startDate !== undefined) {
    goal.startDate = startDate;
  }

  if (deadline !== undefined) {
    goal.deadline = deadline;
  }

  await goal.save();

  return goal;
};

export { createGoal, getGoals, getGoal, updateGoalProgress, deleteGoal, updateGoal };
