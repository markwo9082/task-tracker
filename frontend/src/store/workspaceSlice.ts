import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, WorkspaceMember } from '../types';
import workspaceService, { CreateWorkspaceData, UpdateWorkspaceData } from '../services/workspace.service';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  members: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await workspaceService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch workspaces');
    }
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  'workspace/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await workspaceService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch workspace');
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/create',
  async (data: CreateWorkspaceData, { rejectWithValue }) => {
    try {
      return await workspaceService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create workspace');
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/update',
  async ({ id, data }: { id: string; data: UpdateWorkspaceData }, { rejectWithValue }) => {
    try {
      return await workspaceService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update workspace');
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await workspaceService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete workspace');
    }
  }
);

export const fetchWorkspaceMembers = createAsyncThunk(
  'workspace/fetchMembers',
  async (id: string, { rejectWithValue }) => {
    try {
      return await workspaceService.getMembers(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch members');
    }
  }
);

// Slice
const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action: PayloadAction<Workspace | null>) => {
      state.currentWorkspace = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all workspaces
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workspaces = action.payload;
    });
    builder.addCase(fetchWorkspaces.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch workspace by ID
    builder.addCase(fetchWorkspaceById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaceById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentWorkspace = action.payload;
    });
    builder.addCase(fetchWorkspaceById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create workspace
    builder.addCase(createWorkspace.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createWorkspace.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workspaces.push(action.payload);
    });
    builder.addCase(createWorkspace.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update workspace
    builder.addCase(updateWorkspace.fulfilled, (state, action) => {
      const index = state.workspaces.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.workspaces[index] = action.payload;
      }
      if (state.currentWorkspace?.id === action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    });

    // Delete workspace
    builder.addCase(deleteWorkspace.fulfilled, (state, action) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
      if (state.currentWorkspace?.id === action.payload) {
        state.currentWorkspace = null;
      }
    });

    // Fetch members
    builder.addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
      state.members = action.payload;
    });
  },
});

export const { setCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
