import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { createPost, getFeed, getSavedPosts } from "../../services/api/postApi";

const initialState = {
  posts: [],
  savedPosts: [],
  pagination: null,
  savedPagination: null,
  isLoading: false,
  isSavedLoading: false,
  isCreating: false,
  error: null,
  savedError: null,
};

export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await getFeed(page, limit);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load feed.",
      );
    }
  },
);

export const fetchSavedPosts = createAsyncThunk(
  "posts/fetchSavedPosts",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await getSavedPosts(page, limit);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load saved posts.",
      );
    }
  },
);

export const createNewPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await createPost(postData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create post.",
      );
    }
  },
);

const postSlice = createSlice({
  name: "posts",

  initialState,

  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },

    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);

      state.savedPosts = state.savedPosts.filter(
        (post) => post._id !== action.payload,
      );
    },
  },

  extraReducers: (builder) => {
    builder

      // -------------------------
      // Feed
      // -------------------------

      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.isLoading = false;
        state.error = null;
      })

      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // -------------------------
      // Saved posts
      // -------------------------

      .addCase(fetchSavedPosts.pending, (state) => {
        state.isSavedLoading = true;
        state.savedError = null;
      })

      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.savedPosts = action.payload.posts;
        state.savedPagination = action.payload.pagination;
        state.isSavedLoading = false;
        state.savedError = null;
      })

      .addCase(fetchSavedPosts.rejected, (state, action) => {
        state.isSavedLoading = false;
        state.savedError = action.payload;
      })

      // -------------------------
      // Create post
      // -------------------------

      .addCase(createNewPost.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })

      .addCase(createNewPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.isCreating = false;
        state.error = null;
      })

      .addCase(createNewPost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      });
  },
});

export const { clearPostError, removePost } = postSlice.actions;

export default postSlice.reducer;
