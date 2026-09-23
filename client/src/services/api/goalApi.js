import api from "./axios";

// Create a new goal
export const createGoal = async (goalData) => {
  const response = await api.post("/goals", goalData);

  return response.data;
};

// Get current user's goals
export const getGoals = async (page = 1, limit = 10) => {
  const response = await api.get("/goals", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

// Get a single goal
export const getGoal = async (goalId) => {
  const response = await api.get(`/goals/${goalId}`);

  return response.data;
};

// Update goal progress
export const updateGoalProgress = async (goalId, progress) => {
  const response = await api.patch(`/goals/${goalId}/progress`, {
    progress,
  });

  return response.data;
};

// Update goal details
export const updateGoal = async (goalId, goalData) => {
  const response = await api.patch(`/goals/${goalId}`, goalData);

  return response.data;
};

// Delete a goal
export const deleteGoal = async (goalId) => {
  const response = await api.delete(`/goals/${goalId}`);

  return response.data;
};
