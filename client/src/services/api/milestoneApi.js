import api from "./axios";

export const createMilestone = (
  goalId,
  { title, description = "", order = 0 },
) => {
  return api.post(`/milestones/${goalId}`, {
    title,
    description,
    order,
  });
};

export const getMilestones = (goalId) => {
  return api.get(`/milestones/${goalId}`);
};

export const updateMilestone = (milestoneId, { title, description, order }) => {
  return api.patch(`/milestones/${milestoneId}`, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(order !== undefined && { order }),
  });
};

export const completeMilestone = (milestoneId) => {
  return api.patch(`/milestones/${milestoneId}/complete`);
};

export const deleteMilestone = (milestoneId) => {
  return api.delete(`/milestones/${milestoneId}`);
};
