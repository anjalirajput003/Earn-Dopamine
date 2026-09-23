import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  checkFollowStatus,
  followUser,
  getFollowCounts,
  getUserProfile,
  searchUsers,
  unfollowUser,
} from "../../services/api/profileApi";

const initialState = {
  profile: null,

  followCounts: {
    followers: 0,
    following: 0,
  },

  searchResults: [],

  isLoading: false,

  // Follow/unfollow request currently in progress
  isFollowing: false,

  // Checking whether the current user already follows the profile
  isFollowStatusLoading: false,

  isSearching: false,

  error: null,
  searchError: null,
};

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (username, { rejectWithValue }) => {
    try {
      return await getUserProfile(username);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile.",
      );
    }
  },
);

export const fetchFollowCounts = createAsyncThunk(
  "profile/fetchFollowCounts",
  async (userId, { rejectWithValue }) => {
    try {
      return await getFollowCounts(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch follow counts.",
      );
    }
  },
);

export const fetchFollowStatus = createAsyncThunk(
  "profile/fetchFollowStatus",
  async (userId, { rejectWithValue }) => {
    try {
      return await checkFollowStatus(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch follow status.",
      );
    }
  },
);

export const followProfile = createAsyncThunk(
  "profile/followProfile",
  async (userId, { rejectWithValue }) => {
    try {
      return await followUser(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to follow user.",
      );
    }
  },
);

export const unfollowProfile = createAsyncThunk(
  "profile/unfollowProfile",
  async (userId, { rejectWithValue }) => {
    try {
      return await unfollowUser(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unfollow user.",
      );
    }
  },
);

export const searchProfileUsers = createAsyncThunk(
  "profile/searchUsers",
  async ({ q, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await searchUsers(q, page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search users.",
      );
    }
  },
);

const profileSlice = createSlice({
  name: "profile",

  initialState,

  reducers: {
    clearProfile: (state) => {
      state.profile = null;

      state.followCounts = {
        followers: 0,
        following: 0,
      };

      state.isFollowStatusLoading = false;
      state.isFollowing = false;

      state.error = null;
    },

    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // --------------------------------------------------
      // Fetch profile
      // --------------------------------------------------

      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;

        // Reset relationship state when navigating
        // from one profile to another.
        state.isFollowStatusLoading = false;
        state.isFollowing = false;
      })

      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload?.data ?? null;
        state.isLoading = false;
      })

      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || "Failed to fetch profile.";
      })

      // --------------------------------------------------
      // Follow counts
      // --------------------------------------------------

      .addCase(fetchFollowCounts.fulfilled, (state, action) => {
        state.followCounts = action.payload?.data ?? {
          followers: 0,
          following: 0,
        };
      })

      // --------------------------------------------------
      // Follow status
      // --------------------------------------------------

      .addCase(fetchFollowStatus.pending, (state) => {
        state.isFollowStatusLoading = true;
      })

      .addCase(fetchFollowStatus.fulfilled, (state, action) => {
        state.isFollowStatusLoading = false;

        if (state.profile) {
          state.profile.isFollowing =
            action.payload?.data?.isFollowing ?? false;
        }
      })

      .addCase(fetchFollowStatus.rejected, (state, action) => {
        state.isFollowStatusLoading = false;

        state.error = action.payload || "Failed to fetch follow status.";
      })

      // --------------------------------------------------
      // Follow
      // --------------------------------------------------

      .addCase(followProfile.pending, (state) => {
        state.isFollowing = true;
        state.error = null;
      })

      .addCase(followProfile.fulfilled, (state) => {
        state.isFollowing = false;

        if (state.profile) {
          state.profile.isFollowing = true;
        }

        state.followCounts.followers += 1;
      })

      .addCase(followProfile.rejected, (state, action) => {
        state.isFollowing = false;

        state.error = action.payload || "Failed to follow user.";
      })

      // --------------------------------------------------
      // Unfollow
      // --------------------------------------------------

      .addCase(unfollowProfile.pending, (state) => {
        state.isFollowing = true;
        state.error = null;
      })

      .addCase(unfollowProfile.fulfilled, (state) => {
        state.isFollowing = false;

        if (state.profile) {
          state.profile.isFollowing = false;
        }

        state.followCounts.followers = Math.max(
          0,
          state.followCounts.followers - 1,
        );
      })

      .addCase(unfollowProfile.rejected, (state, action) => {
        state.isFollowing = false;

        state.error = action.payload || "Failed to unfollow user.";
      })

      // --------------------------------------------------
      // Search
      // --------------------------------------------------

      .addCase(searchProfileUsers.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })

      .addCase(searchProfileUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload?.data?.users ?? [];

        state.isSearching = false;
      })

      .addCase(searchProfileUsers.rejected, (state, action) => {
        state.isSearching = false;

        state.searchError = action.payload || "Failed to search users.";
      });
  },
});

export const { clearProfile, clearSearchResults } = profileSlice.actions;

export default profileSlice.reducer;
