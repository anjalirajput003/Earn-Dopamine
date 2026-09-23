import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
  updateGoalProgress,
} from "../../services/api/goalApi";

// ---------------------------------------------
// Fetch goals
// ---------------------------------------------

export const fetchGoals = createAsyncThunk(
  "goals/fetchGoals",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await getGoals(page, limit);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch goals.",
      );
    }
  },
);

// ---------------------------------------------
// Create goal
// ---------------------------------------------

export const createNewGoal = createAsyncThunk(
  "goals/createGoal",
  async (goalData, { rejectWithValue }) => {
    try {
      return await createGoal(goalData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create goal.",
      );
    }
  },
);

// ---------------------------------------------
// Update goal
// ---------------------------------------------

export const updateExistingGoal = createAsyncThunk(
  "goals/updateGoal",
  async ({ goalId, goalData }, { rejectWithValue }) => {
    try {
      return await updateGoal(goalId, goalData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update goal.",
      );
    }
  },
);

// ---------------------------------------------
// Update progress
// ---------------------------------------------

export const updateGoalProgressValue = createAsyncThunk(
  "goals/updateProgress",
  async ({ goalId, progress }, { rejectWithValue }) => {
    try {
      return await updateGoalProgress(goalId, progress);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update goal progress.",
      );
    }
  },
);

// ---------------------------------------------
// Delete goal
// ---------------------------------------------

export const removeGoal = createAsyncThunk(
  "goals/deleteGoal",
  async (goalId, { rejectWithValue }) => {
    try {
      await deleteGoal(goalId);

      return goalId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete goal.",
      );
    }
  },
);

// ---------------------------------------------
// Initial state
// ---------------------------------------------

const initialState = {
  goals: [],
  pagination: null,

  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isUpdatingProgress: false,
  isDeleting: false,

  error: null,
};

// ---------------------------------------------
// Slice
// ---------------------------------------------

const goalSlice = createSlice({
  name: "goals",

  initialState,

  reducers: {
    clearGoalError: (state) => {
      state.error = null;
    },

    clearGoals: (state) => {
      state.goals = [];
      state.pagination = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ---------------------------------------
      // Fetch goals
      // ---------------------------------------

      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;

        const data = action.payload?.data;

        state.goals = data?.goals || [];
        state.pagination = data?.pagination || null;
      })

      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---------------------------------------
      // Create goal
      // ---------------------------------------

      .addCase(createNewGoal.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })

      .addCase(createNewGoal.fulfilled, (state, action) => {
        state.isCreating = false;

        const goal = action.payload?.data;

        if (goal) {
          state.goals.unshift(goal);
        }
      })

      .addCase(createNewGoal.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // ---------------------------------------
      // Update goal
      // ---------------------------------------

      .addCase(updateExistingGoal.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })

      .addCase(updateExistingGoal.fulfilled, (state, action) => {
        state.isUpdating = false;

        const updatedGoal = action.payload?.data;

        if (!updatedGoal) {
          return;
        }

        const index = state.goals.findIndex(
          (goal) => goal._id === updatedGoal._id,
        );

        if (index !== -1) {
          state.goals[index] = updatedGoal;
        }
      })

      .addCase(updateExistingGoal.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // ---------------------------------------
      // Update progress
      // ---------------------------------------

      .addCase(updateGoalProgressValue.pending, (state) => {
        state.isUpdatingProgress = true;
        state.error = null;
      })

      .addCase(updateGoalProgressValue.fulfilled, (state, action) => {
        state.isUpdatingProgress = false;

        const updatedGoal = action.payload?.data;

        if (!updatedGoal) {
          return;
        }

        const index = state.goals.findIndex(
          (goal) => goal._id === updatedGoal._id,
        );

        if (index !== -1) {
          state.goals[index] = updatedGoal;
        }
      })

      .addCase(updateGoalProgressValue.rejected, (state, action) => {
        state.isUpdatingProgress = false;
        state.error = action.payload;
      })

      // ---------------------------------------
      // Delete goal
      // ---------------------------------------

      .addCase(removeGoal.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })

      .addCase(removeGoal.fulfilled, (state, action) => {
        state.isDeleting = false;

        state.goals = state.goals.filter((goal) => goal._id !== action.payload);
      })

      .addCase(removeGoal.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearGoalError, clearGoals } = goalSlice.actions;

export default goalSlice.reducer;
