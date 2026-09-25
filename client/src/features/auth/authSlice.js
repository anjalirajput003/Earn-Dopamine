import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"; 

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../../services/api/authApi";

import { setAccessToken } from "../../services/api/axios";
import api from "../../services/api/axios";

// -----------------------------
// INITIAL STATE
// -----------------------------

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,
};

// -----------------------------
// THUNKS
// -----------------------------

//checks who the currently logged in user is and what is its state-> loggedin or logged out
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      const refreshResponse = await api.post("/auth/refresh-token");

      setAccessToken(refreshResponse.data.accessToken);

      const response = await getCurrentUser();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to initialize authentication.",
      );
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);

      setAccessToken(response.data.accessToken);

      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed.");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",

  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUser(userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed.",
      );
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",

  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();

      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed.");
    }
  },
);

// -----------------------------
// SLICE
// -----------------------------

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // INITIALIZE AUTH
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })

      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitializing = false;
        state.error = null;
      })

      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitializing = false;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })

      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload;
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })

      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })

      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
