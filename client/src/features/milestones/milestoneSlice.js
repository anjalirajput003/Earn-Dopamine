import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createMilestone as createMilestoneApi,
  getMilestones as getMilestonesApi,
  updateMilestone as updateMilestoneApi,
  completeMilestone as completeMilestoneApi,
  deleteMilestone as deleteMilestoneApi,
} from "../../services/api/milestoneApi";

const initialState = {
  milestonesByGoal: {},
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchMilestones = createAsyncThunk(
  "milestones/fetchMilestones",
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await getMilestonesApi(goalId);

      const responseData = response.data?.data;

      const milestones = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.milestones)
          ? responseData.milestones
          : [];

      return {
        goalId,
        milestones,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch milestones.",
      );
    }
  },
);

export const createMilestone = createAsyncThunk(
  "milestones/createMilestone",
  async ({ goalId, title, description, order }, { rejectWithValue }) => {
    try {
      const response = await createMilestoneApi(goalId, {
        title,
        description,
        order,
      });

      return {
        goalId,
        milestone: response.data?.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create milestone.",
      );
    }
  },
);

export const updateMilestone = createAsyncThunk(
  "milestones/updateMilestone",
  async (
    { milestoneId, goalId, title, description, order },
    { rejectWithValue },
  ) => {
    try {
      const response = await updateMilestoneApi(milestoneId, {
        title,
        description,
        order,
      });

      return {
        goalId,
        milestone: response.data?.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update milestone.",
      );
    }
  },
);

export const completeMilestone = createAsyncThunk(
  "milestones/completeMilestone",
  async ({ milestoneId, goalId }, { rejectWithValue }) => {
    try {
      const response = await completeMilestoneApi(milestoneId);

      return {
        goalId,
        milestone: response.data?.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete milestone.",
      );
    }
  },
);

export const deleteMilestone = createAsyncThunk(
  "milestones/deleteMilestone",
  async ({ milestoneId, goalId }, { rejectWithValue }) => {
    try {
      await deleteMilestoneApi(milestoneId);

      return {
        goalId,
        milestoneId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete milestone.",
      );
    }
  },
);

const milestoneSlice = createSlice({
  name: "milestones",

  initialState,

  reducers: {
    clearMilestoneError: (state) => {
      state.error = null;
    },

    clearMilestonesForGoal: (state, action) => {
      delete state.milestonesByGoal[action.payload];
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch
      .addCase(fetchMilestones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMilestones.fulfilled, (state, action) => {
        state.loading = false;

        state.milestonesByGoal[action.payload.goalId] =
          action.payload.milestones;
      })

      .addCase(fetchMilestones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createMilestone.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(createMilestone.fulfilled, (state, action) => {
        state.actionLoading = false;

        const { goalId, milestone } = action.payload;

        if (!milestone) return;

        if (!state.milestonesByGoal[goalId]) {
          state.milestonesByGoal[goalId] = [];
        }

        state.milestonesByGoal[goalId].push(milestone);

        state.milestonesByGoal[goalId].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
      })

      .addCase(createMilestone.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateMilestone.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.actionLoading = false;

        const { goalId, milestone } = action.payload;

        if (!milestone || !state.milestonesByGoal[goalId]) return;

        const index = state.milestonesByGoal[goalId].findIndex(
          (item) => item._id === milestone._id,
        );

        if (index !== -1) {
          state.milestonesByGoal[goalId][index] = milestone;
        }

        state.milestonesByGoal[goalId].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
      })

      .addCase(updateMilestone.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Complete
      .addCase(completeMilestone.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(completeMilestone.fulfilled, (state, action) => {
        state.actionLoading = false;

        const { goalId, milestone } = action.payload;

        if (!milestone || !state.milestonesByGoal[goalId]) return;

        const index = state.milestonesByGoal[goalId].findIndex(
          (item) => item._id === milestone._id,
        );

        if (index !== -1) {
          state.milestonesByGoal[goalId][index] = milestone;
        }
      })

      .addCase(completeMilestone.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteMilestone.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.actionLoading = false;

        const { goalId, milestoneId } = action.payload;

        if (!state.milestonesByGoal[goalId]) return;

        state.milestonesByGoal[goalId] = state.milestonesByGoal[goalId].filter(
          (milestone) => milestone._id !== milestoneId,
        );
      })

      .addCase(deleteMilestone.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMilestoneError, clearMilestonesForGoal } =
  milestoneSlice.actions;

export default milestoneSlice.reducer;
