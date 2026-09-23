import api from "./axios";

// Create a study room
export const createStudyRoom = async (name) => {
  const response = await api.post("/study-rooms", { name });
  return response.data;
};

// Get a study room
export const getStudyRoom = async (roomId) => {
  const response = await api.get(`/study-rooms/${roomId}`);
  return response.data;
};

// Join a study room
export const joinStudyRoom = async (roomId) => {
  const response = await api.post(`/study-rooms/${roomId}/join`);
  return response.data;
};

//discover study rooms
export const getDiscoverableStudyRooms = async () => {
  const response = await api.get("/study-rooms/discover");
  return response.data;
};

// Leave a study room
export const leaveStudyRoom = async (roomId) => {
  const response = await api.post(`/study-rooms/${roomId}/leave`);
  return response.data;
};

// Start study session
export const startStudySession = async (roomId) => {
  const response = await api.post(`/study-rooms/${roomId}/session/start`);
  return response.data;
};

// Pause study session
export const pauseStudySession = async (roomId) => {
  const response = await api.post(`/study-rooms/${roomId}/session/pause`);
  return response.data;
};

// Resume study session
export const resumeStudySession = async (roomId) => {
  const response = await api.post(`/study-rooms/${roomId}/session/resume`);
  return response.data;
};

// Stop study session
export const stopStudySession = async (roomId) => {
  const response = await api.post(`/study-rooms/${roomId}/session/stop`);
  return response.data;
};

// Get current study session
export const getCurrentStudySession = async (roomId) => {
  const response = await api.get(`/study-rooms/${roomId}/session/current`);
  return response.data;
};

//get other participants sessions
export const getParticipantStudySessions = async (roomId) => {
  const response = await api.get(`/study-rooms/${roomId}/session/participants`);

  return response.data;
};

// Get study statistics
export const getStudyStatistics = async (roomId) => {
  const response = await api.get(`/study-rooms/${roomId}/stats`);
  return response.data;
};

export const getMyStudyRooms = async () => {
  const response = await api.get("/study-rooms");
  return response.data;
};

export const deleteStudyRoom = async (roomId) => {
  const response = await api.delete(`/study-rooms/${roomId}`);
  return response.data;
};
