import api from "./axios";

export const getUserProfile = async (username) => {
  const response = await api.get(`/users/${username}`);

  return response.data;
};

export const searchUsers = async (q, page = 1, limit = 10) => {
  const response = await api.get("/users/search", {
    params: {
      q,
      page,
      limit,
    },
  });

  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch("/users/profile", profileData);

  return response.data;
};

export const updateAvatar = async (file) => {
  const formData = new FormData();

  formData.append("avatar", file);

  const response = await api.patch("/users/avatar", formData);

  return response.data;
};

export const updateCoverImage = async (file) => {
  const formData = new FormData();

  formData.append("coverImage", file);

  const response = await api.patch("/users/cover-image", formData);

  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.post(`/users/${userId}`);

  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);

  return response.data;
};

export const getFollowCounts = async (userId) => {
  const response = await api.get(`/users/${userId}/counts`);

  return response.data;
};

export const checkFollowStatus = async (userId) => {
  const response = await api.get(`/users/${userId}/status`);
  return response.data;
};
