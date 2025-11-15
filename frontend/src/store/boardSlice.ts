import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import boardService from '../services/board.service';
import { Board, Lane, BoardMember } from '../types';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  members: BoardMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  members: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBoards = createAsyncThunk(
  'board/fetchBoards',
  async (workspaceId: string | undefined, { rejectWithValue }) => {
    try {
      return await boardService.getBoards(workspaceId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch boards'
      );
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (id: string, { rejectWithValue }) => {
    try {
      return await boardService.getBoard(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch board'
      );
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (
    data: {
      workspaceId: string;
      name: string;
      description?: string;
      createDefaultLanes?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await boardService.createBoard(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create board'
      );
    }
  }
);

export const updateBoard = createAsyncThunk(
  'board/updateBoard',
  async (
    { id, data }: { id: string; data: { name?: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      return await boardService.updateBoard(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update board'
      );
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'board/deleteBoard',
  async (id: string, { rejectWithValue }) => {
    try {
      await boardService.deleteBoard(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete board'
      );
    }
  }
);

export const createLane = createAsyncThunk(
  'board/createLane',
  async (
    {
      boardId,
      data,
    }: {
      boardId: string;
      data: { name: string; position: number; wipLimit?: number };
    },
    { rejectWithValue }
  ) => {
    try {
      return await boardService.createLane(boardId, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create lane'
      );
    }
  }
);

export const updateLane = createAsyncThunk(
  'board/updateLane',
  async (
    {
      boardId,
      laneId,
      data,
    }: {
      boardId: string;
      laneId: string;
      data: { name?: string; position?: number; wipLimit?: number };
    },
    { rejectWithValue }
  ) => {
    try {
      return await boardService.updateLane(boardId, laneId, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update lane'
      );
    }
  }
);

export const deleteLane = createAsyncThunk(
  'board/deleteLane',
  async (
    { boardId, laneId }: { boardId: string; laneId: string },
    { rejectWithValue }
  ) => {
    try {
      await boardService.deleteLane(boardId, laneId);
      return laneId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete lane'
      );
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.members = [];
    },
    updateLaneInCurrentBoard: (state, action: PayloadAction<Lane>) => {
      if (state.currentBoard && state.currentBoard.lanes) {
        const index = state.currentBoard.lanes.findIndex(
          (lane) => lane.id === action.payload.id
        );
        if (index !== -1) {
          state.currentBoard.lanes[index] = action.payload;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch boards
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.isLoading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch board
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.isLoading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create board
    builder
      .addCase(createBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.isLoading = false;
        state.boards.push(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update board
    builder
      .addCase(updateBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.isLoading = false;
        const index = state.boards.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?.id === action.payload.id) {
          state.currentBoard = { ...state.currentBoard, ...action.payload };
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete board
    builder
      .addCase(deleteBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.boards = state.boards.filter((b) => b.id !== action.payload);
        if (state.currentBoard?.id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create lane
    builder
      .addCase(createLane.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLane.fulfilled, (state, action: PayloadAction<Lane>) => {
        state.isLoading = false;
        if (state.currentBoard?.lanes) {
          state.currentBoard.lanes.push(action.payload);
        }
      })
      .addCase(createLane.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update lane
    builder
      .addCase(updateLane.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLane.fulfilled, (state, action: PayloadAction<Lane>) => {
        state.isLoading = false;
        if (state.currentBoard?.lanes) {
          const index = state.currentBoard.lanes.findIndex(
            (lane) => lane.id === action.payload.id
          );
          if (index !== -1) {
            state.currentBoard.lanes[index] = action.payload;
          }
        }
      })
      .addCase(updateLane.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete lane
    builder
      .addCase(deleteLane.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLane.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        if (state.currentBoard?.lanes) {
          state.currentBoard.lanes = state.currentBoard.lanes.filter(
            (lane) => lane.id !== action.payload
          );
        }
      })
      .addCase(deleteLane.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentBoard, updateLaneInCurrentBoard } =
  boardSlice.actions;
export default boardSlice.reducer;
