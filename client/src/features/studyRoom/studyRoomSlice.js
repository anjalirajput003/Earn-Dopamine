import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createStudyRoom,
  getMyStudyRooms,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  stopStudySession,
  getCurrentStudySession,
  getStudyStatistics,
  deleteStudyRoom,
  getDiscoverableStudyRooms,
  getParticipantStudySessions,
} from "../../services/api/studyRoomApi";

export const createNewStudyRoom = createAsyncThunk(
  "studyRoom/create",
  async (name, { rejectWithValue }) => {
    try {
      return await createStudyRoom(name);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create study room.",
      );
    }
  },
);

export const fetchStudyRoom = createAsyncThunk(
  "studyRoom/fetch",
  async (roomId, { rejectWithValue }) => {
    try {
      return await getStudyRoom(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch study room.",
      );
    }
  },
);

export const joinExistingStudyRoom = createAsyncThunk(
  "studyRoom/join",
  async (roomId, { rejectWithValue }) => {
    try {
      return await joinStudyRoom(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to join study room.",
      );
    }
  },
);

export const leaveExistingStudyRoom = createAsyncThunk(
  "studyRoom/leave",
  async (roomId, { rejectWithValue }) => {
    try {
      return await leaveStudyRoom(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to leave study room.",
      );
    }
  },
);

export const startExistingStudySession = createAsyncThunk(
  "studyRoom/startSession",
  async (roomId, { rejectWithValue }) => {
    try {
      return await startStudySession(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start session.",
      );
    }
  },
);

export const pauseExistingStudySession = createAsyncThunk(
  "studyRoom/pauseSession",
  async (roomId, { rejectWithValue }) => {
    try {
      return await pauseStudySession(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to pause session.",
      );
    }
  },
);

export const resumeExistingStudySession = createAsyncThunk(
  "studyRoom/resumeSession",
  async (roomId, { rejectWithValue }) => {
    try {
      return await resumeStudySession(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resume session.",
      );
    }
  },
);

export const stopExistingStudySession = createAsyncThunk(
  "studyRoom/stopSession",
  async (roomId, { rejectWithValue }) => {
    try {
      return await stopStudySession(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to stop session.",
      );
    }
  },
);

export const fetchCurrentStudySession = createAsyncThunk(
  "studyRoom/currentSession",
  async (roomId, { rejectWithValue }) => {
    try {
      return await getCurrentStudySession(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch current session.",
      );
    }
  },
);

export const fetchParticipantStudySessions = createAsyncThunk(
  "studyRoom/fetchParticipantStudySessions",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await getParticipantStudySessions(roomId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch participant study sessions.",
      );
    }
  },
);

export const fetchStudyStatistics = createAsyncThunk(
  "studyRoom/statistics",
  async (roomId, { rejectWithValue }) => {
    try {
      return await getStudyStatistics(roomId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch study statistics.",
      );
    }
  },
);

export const fetchMyStudyRooms = createAsyncThunk(
  "studyRoom/fetchMyStudyRooms",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyStudyRooms();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch study rooms.",
      );
    }
  },
);

export const fetchDiscoverableStudyRooms = createAsyncThunk(
  "studyRoom/fetchDiscoverableStudyRooms",
  async (_, { rejectWithValue }) => {
    try {
      return await getDiscoverableStudyRooms();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch study rooms.",
      );
    }
  },
);

export const removeStudyRoom = createAsyncThunk(
  "studyRoom/removeStudyRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await deleteStudyRoom(roomId);

      return {
        roomId,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete study room.",
      );
    }
  },
);

const initialState = {
  room: null,
  session: null,
  statistics: null,
  isLoading: false,
  isCreating: false,
  isJoining: false,
  isLeaving: false,
  isSessionLoading: false,
  error: null,
  rooms: [],
  isDeleting: false,
  discoverableRooms: [],
  participantSessions: [],
};

const studyRoomSlice = createSlice({
  name: "studyRoom",
  initialState,

  reducers: {
    clearStudyRoom: (state) => {
      state.room = null;
      state.session = null;
      state.statistics = null;
      state.error = null;
    },

    clearStudyRoomError: (state) => {
      state.error = null;
    },

    updateParticipantSession: (state, action) => {
      const { userId, session } = action.payload;

      const participant = state.participantSessions.find(
        (item) => item.user?._id === userId,
      );

      if (participant) {
        participant.session = session;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createNewStudyRoom.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createNewStudyRoom.fulfilled, (state, action) => {
        state.isCreating = false;
        state.room = action.payload?.data || null;
      })
      .addCase(createNewStudyRoom.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      .addCase(fetchStudyRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudyRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.room = action.payload?.data || null;
      })
      .addCase(fetchStudyRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(joinExistingStudyRoom.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })
      .addCase(joinExistingStudyRoom.fulfilled, (state, action) => {
        state.isJoining = false;
        state.room = action.payload?.data || null;
      })
      .addCase(joinExistingStudyRoom.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload;
      })

      .addCase(leaveExistingStudyRoom.pending, (state) => {
        state.isLeaving = true;
        state.error = null;
      })
      .addCase(leaveExistingStudyRoom.fulfilled, (state) => {
        state.isLeaving = false;
        state.room = null;
        state.session = null;
      })
      .addCase(leaveExistingStudyRoom.rejected, (state, action) => {
        state.isLeaving = false;
        state.error = action.payload;
      })

      .addCase(startExistingStudySession.pending, (state) => {
        state.isSessionLoading = true;
        state.error = null;
      })
      .addCase(startExistingStudySession.fulfilled, (state, action) => {
        state.isSessionLoading = false;

        const session = action.payload?.data || null;
        state.session = session;

        if (session?.user) {
          const participant = state.participantSessions.find(
            (item) => item.user?._id === session.user,
          );

          if (participant) {
            participant.session = session;
          }
        }
      })
      .addCase(startExistingStudySession.rejected, (state, action) => {
        state.isSessionLoading = false;
        state.error = action.payload;
      })

      .addCase(pauseExistingStudySession.fulfilled, (state, action) => {
        const session = action.payload?.data || state.session;

        state.session = session;

        if (session?.user) {
          const participant = state.participantSessions.find(
            (item) => item.user?._id === session.user,
          );

          if (participant) {
            participant.session = session;
          }
        }
      })
      .addCase(pauseExistingStudySession.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(resumeExistingStudySession.fulfilled, (state, action) => {
        const session = action.payload?.data || state.session;

        state.session = session;

        if (session?.user) {
          const participant = state.participantSessions.find(
            (item) => item.user?._id === session.user,
          );

          if (participant) {
            participant.session = session;
          }
        }
      })
      .addCase(resumeExistingStudySession.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(stopExistingStudySession.fulfilled, (state, action) => {
        const session = action.payload?.data || null;

        state.session = session;

        if (session?.user) {
          const participant = state.participantSessions.find(
            (item) => item.user?._id === session.user,
          );

          if (participant) {
            participant.session = session;
          }
        }
      })
      .addCase(stopExistingStudySession.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchCurrentStudySession.fulfilled, (state, action) => {
        state.session = action.payload?.data || null;
      })
      .addCase(fetchCurrentStudySession.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchStudyStatistics.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchStudyStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload?.data || null;
      })
      .addCase(fetchStudyStatistics.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchMyStudyRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyStudyRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload?.data || [];
      })
      .addCase(fetchMyStudyRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(removeStudyRoom.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(removeStudyRoom.fulfilled, (state, action) => {
        state.isDeleting = false;

        state.rooms = state.rooms.filter(
          (room) => room._id !== action.payload.roomId,
        );

        if (state.room?._id === action.payload.roomId) {
          state.room = null;
        }
      })
      .addCase(removeStudyRoom.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      .addCase(fetchDiscoverableStudyRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscoverableStudyRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.discoverableRooms = action.payload?.data || [];
      })
      .addCase(fetchDiscoverableStudyRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchParticipantStudySessions.pending, (state) => {
        state.isSessionLoading = true;
        state.error = null;
      })
      .addCase(fetchParticipantStudySessions.fulfilled, (state, action) => {
        state.isSessionLoading = false;
        state.participantSessions = action.payload;
      })
      .addCase(fetchParticipantStudySessions.rejected, (state, action) => {
        state.isSessionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStudyRoom, clearStudyRoomError, updateParticipantSession } =
  studyRoomSlice.actions;

export default studyRoomSlice.reducer;
