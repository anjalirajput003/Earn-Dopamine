import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import postReducer from "../features/posts/postSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import profileReducer from "../features/profile/profileSlice";
import goalReducer from "../features/goals/goalSlice";
import studyRoomReducer from "../features/studyRoom/studyRoomSlice";
import milestoneReducer from "../features/milestones/milestoneSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    notifications: notificationReducer,
    profile: profileReducer,
    goals: goalReducer,
    studyRoom: studyRoomReducer,
    milestones: milestoneReducer,
  },
});
