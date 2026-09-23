import api from "./axios";

export const getFeed = async (page = 1, limit = 10) => {
  const response = await api.get("/posts/feed", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

export const getUserPosts = async (username, page = 1, limit = 12) => {
  const response = await api.get(`/posts/user/${username}`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

export const createPost = async ({ files, caption, visibility }) => {
  const formData = new FormData();

  formData.append("caption", caption);
  formData.append("visibility", visibility);

  files.forEach((file) => {
    formData.append("media", file);
  });

  const response = await api.post("/posts", formData);

  return response.data;
};

export const cheerPost = async (postId) => {
  const response = await api.post(`/cheers/${postId}`);

  return response.data;
};

export const uncheerPost = async (postId) => {
  const response = await api.delete(`/cheers/${postId}`);

  return response.data;
};

export const checkCheerStatus = async (postId) => {
  const response = await api.get(`/cheers/${postId}`);

  return response.data;
};

export const getPostComments = async (postId, page = 1, limit = 10) => {
  const response = await api.get(`/comments/${postId}`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

export const createComment = async (postId, content) => {
  const response = await api.post(`/comments/${postId}`, {
    content,
  });

  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);

  return response.data;
};

export const savePost = async (postId) => {
  const response = await api.post(`/saves/${postId}`);

  return response.data;
};

export const unsavePost = async (postId) => {
  const response = await api.delete(`/saves/${postId}`);

  return response.data;
};

export const checkSavedPost = async (postId) => {
  const response = await api.get(`/saves/${postId}`);

  return response.data;
};

export const getSavedPosts = async (page = 1, limit = 10) => {
  const response = await api.get("/saves", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};
