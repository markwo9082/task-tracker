import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import workspaceService from '../services/workspace.service';
import { Workspace, WorkspaceMember, WorkspaceMemberRole } from '../types';

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
  'workspace/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      return await workspaceService.getWorkspaces();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch workspaces'
      );
    }
  }
);

export const fetchWorkspace = createAsyncThunk(
  'workspace/fetchWorkspace',
  async (id: string, { rejectWithValue }) => {
    try {
      return await workspaceService.getWorkspace(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch workspace'
      );
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async (
    data: { name: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      return await workspaceService.createWorkspace(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create workspace'
      );
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/updateWorkspace',
  async (
    { id, data }: { id: string; data: { name?: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      return await workspaceService.updateWorkspace(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update workspace'
      );
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/deleteWorkspace',
  async (id: string, { rejectWithValue }) => {
    try {
      await workspaceService.deleteWorkspace(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete workspace'
      );
    }
  }
);

export const fetchWorkspaceMembers = createAsyncThunk(
  'workspace/fetchMembers',
  async (id: string, { rejectWithValue }) => {
    try {
      return await workspaceService.getMembers(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch members'
      );
    }
  }
);

export const addWorkspaceMember = createAsyncThunk(
  'workspace/addMember',
  async (
    { id, userId, role }: { id: string; userId: string; role: WorkspaceMemberRole },
    { rejectWithValue }
  ) => {
    try {
      return await workspaceService.addMember(id, { userId, role });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add member'
      );
    }
  }
);

export const removeWorkspaceMember = createAsyncThunk(
  'workspace/removeMember',
  async (
    { id, userId }: { id: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await workspaceService.removeMember(id, userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove member'
      );
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
      state.members = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch workspaces
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchWorkspaces.fulfilled,
        (state, action: PayloadAction<Workspace[]>) => {
          state.isLoading = false;
          state.workspaces = action.payload;
        }
      )
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch workspace
    builder
      .addCase(fetchWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchWorkspace.fulfilled,
        (state, action: PayloadAction<Workspace>) => {
          state.isLoading = false;
          state.currentWorkspace = action.payload;
        }
      )
      .addCase(fetchWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create workspace
    builder
      .addCase(createWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createWorkspace.fulfilled,
        (state, action: PayloadAction<Workspace>) => {
          state.isLoading = false;
          state.workspaces.push(action.payload);
        }
      )
      .addCase(createWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update workspace
    builder
      .addCase(updateWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateWorkspace.fulfilled,
        (state, action: PayloadAction<Workspace>) => {
          state.isLoading = false;
          const index = state.workspaces.findIndex(
            (w) => w.id === action.payload.id
          );
          if (index !== -1) {
            state.workspaces[index] = action.payload;
          }
          if (state.currentWorkspace?.id === action.payload.id) {
            state.currentWorkspace = action.payload;
          }
        }
      )
      .addCase(updateWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete workspace
    builder
      .addCase(deleteWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.workspaces = state.workspaces.filter(
          (w) => w.id !== action.payload
        );
        if (state.currentWorkspace?.id === action.payload) {
          state.currentWorkspace = null;
        }
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch members
    builder
      .addCase(fetchWorkspaceMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchWorkspaceMembers.fulfilled,
        (state, action: PayloadAction<WorkspaceMember[]>) => {
          state.isLoading = false;
          state.members = action.payload;
        }
      )
      .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add member
    builder
      .addCase(addWorkspaceMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addWorkspaceMember.fulfilled,
        (state, action: PayloadAction<WorkspaceMember>) => {
          state.isLoading = false;
          state.members.push(action.payload);
        }
      )
      .addCase(addWorkspaceMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove member
    builder
      .addCase(removeWorkspaceMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        removeWorkspaceMember.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.members = state.members.filter(
            (m) => m.userId !== action.payload
          );
        }
      )
      .addCase(removeWorkspaceMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
