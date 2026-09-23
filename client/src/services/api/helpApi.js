import api from "./axios";

export const offerHelp = (postId, message = "") => {
  return api.post(`/helps/${postId}`, {
    message,
  });
};

export const getReceivedHelp = (page = 1, limit = 10) => {
  return api.get("/helps/received", {
    params: {
      page,
      limit,
    },
  });
};

export const getSentHelp = (page = 1, limit = 10) => {
  return api.get("/helps/sent", {
    params: {
      page,
      limit,
    },
  });
};

export const respondToHelp = (helpId, status) => {
  return api.patch(`/helps/${helpId}/respond`, {
    status,
  });
};

export const completeHelp = (helpId) => {
  return api.patch(`/helps/${helpId}/complete`);
};
