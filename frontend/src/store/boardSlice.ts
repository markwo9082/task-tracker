import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Board, Lane } from '../types';
import boardService, { CreateBoardData, UpdateBoardData } from '../services/board.service';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBoards = createAsyncThunk(
  'board/fetchAll',
  async (workspaceId: string | undefined, { rejectWithValue }) => {
    try {
      return await boardService.getAll(workspaceId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch boards');
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  'board/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await boardService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch board');
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/create',
  async (data: CreateBoardData, { rejectWithValue }) => {
    try {
      return await boardService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'board/update',
  async ({ id, data }: { id: string; data: UpdateBoardData }, { rejectWithValue }) => {
    try {
      return await boardService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'board/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await boardService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete board');
    }
  }
);

// Slice
const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
      state.currentBoard = action.payload;
    },
    updateLaneInCurrentBoard: (state, action: PayloadAction<Lane>) => {
      if (state.currentBoard?.lanes) {
        const index = state.currentBoard.lanes.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.currentBoard.lanes[index] = action.payload;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all boards
    builder.addCase(fetchBoards.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBoards.fulfilled, (state, action) => {
      state.isLoading = false;
      state.boards = action.payload;
    });
    builder.addCase(fetchBoards.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch board by ID
    builder.addCase(fetchBoardById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBoardById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentBoard = action.payload;
    });
    builder.addCase(fetchBoardById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create board
    builder.addCase(createBoard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createBoard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.boards.push(action.payload);
    });
    builder.addCase(createBoard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update board
    builder.addCase(updateBoard.fulfilled, (state, action) => {
      const index = state.boards.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
      if (state.currentBoard?.id === action.payload.id) {
        state.currentBoard = { ...state.currentBoard, ...action.payload };
      }
    });

    // Delete board
    builder.addCase(deleteBoard.fulfilled, (state, action) => {
      state.boards = state.boards.filter((b) => b.id !== action.payload);
      if (state.currentBoard?.id === action.payload) {
        state.currentBoard = null;
      }
    });
  },
});

export const { setCurrentBoard, updateLaneInCurrentBoard, clearError } = boardSlice.actions;
export default boardSlice.reducer;
