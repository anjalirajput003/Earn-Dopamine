import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/api/notificationApi";

const initialState = {
  notifications: [],
  unreadCount: 0,

  page: 1,
  hasMore: true,

  isLoading: false,
  isLoadingMore: false,
  isUpdating: false,

  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await getNotifications(page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch notifications.",
      );
    }
  },
);

export const fetchUnreadNotificationCount = createAsyncThunk(
  "notifications/fetchUnreadNotificationCount",
  async (_, { rejectWithValue }) => {
    try {
      return await getUnreadNotificationCount();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch unread notification count.",
      );
    }
  },
);

export const readNotification = createAsyncThunk(
  "notifications/readNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      return await markNotificationAsRead(notificationId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark notification as read.",
      );
    }
  },
);

export const readAllNotifications = createAsyncThunk(
  "notifications/readAllNotifications",
  async (_, { rejectWithValue }) => {
    try {
      return await markAllNotificationsAsRead();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark notifications as read.",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },

    clearNotificationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ─────────────────────────────────────────────
      // Fetch notifications
      // ─────────────────────────────────────────────

      .addCase(fetchNotifications.pending, (state, action) => {
        const page = action.meta.arg?.page ?? 1;

        if (page === 1) {
          state.isLoading = true;
        } else {
          state.isLoadingMore = true;
        }

        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const page = action.meta.arg?.page ?? 1;

        const data = action.payload?.data;

        const notifications = data?.notifications ?? [];
        const pagination = data?.pagination;

        if (page === 1) {
          state.notifications = notifications;
        } else {
          state.notifications.push(...notifications);
        }

        state.page = pagination?.page ?? page;

        // Backend uses hasNextPage
        state.hasMore = pagination?.hasNextPage ?? false;

        state.isLoading = false;
        state.isLoadingMore = false;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;

        state.error =
          action.payload || "Failed to fetch notifications.";
      })

      // ─────────────────────────────────────────────
      // Unread count
      // ─────────────────────────────────────────────

      .addCase(
        fetchUnreadNotificationCount.fulfilled,
        (state, action) => {
          state.unreadCount =
            action.payload?.data?.unreadCount ?? 0;
        },
      )

      .addCase(
        fetchUnreadNotificationCount.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to fetch unread notification count.";
        },
      )

      // ─────────────────────────────────────────────
      // Mark single notification as read
      // ─────────────────────────────────────────────

      .addCase(readNotification.pending, (state) => {
        state.isUpdating = true;
      })

      .addCase(readNotification.fulfilled, (state, action) => {
        const updatedNotification = action.payload?.data;

        if (updatedNotification?._id) {
          const index = state.notifications.findIndex(
            (notification) =>
              notification._id === updatedNotification._id,
          );

          if (index !== -1) {
            const previousNotification =
              state.notifications[index];

            state.notifications[index] = updatedNotification;

            // Only decrease unread count if it was actually unread
            if (
              previousNotification.isRead === false &&
              updatedNotification.isRead === true &&
              state.unreadCount > 0
            ) {
              state.unreadCount -= 1;
            }
          }
        }

        state.isUpdating = false;
      })

      .addCase(readNotification.rejected, (state, action) => {
        state.isUpdating = false;

        state.error =
          action.payload ||
          "Failed to mark notification as read.";
      })

      // ─────────────────────────────────────────────
      // Mark all notifications as read
      // ─────────────────────────────────────────────

      .addCase(readAllNotifications.pending, (state) => {
        state.isUpdating = true;
      })

      .addCase(readAllNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.map(
          (notification) => ({
            ...notification,
            isRead: true,
          }),
        );

        state.unreadCount = 0;
        state.isUpdating = false;
      })

      .addCase(readAllNotifications.rejected, (state, action) => {
        state.isUpdating = false;

        state.error =
          action.payload ||
          "Failed to mark notifications as read.";
      });
  },
});

export const {
  addNotification,
  clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;