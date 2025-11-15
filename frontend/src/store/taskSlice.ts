import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import taskService from '../services/task.service';
import { Task, Comment, Subtask, TaskPriority } from '../types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (
    params: { boardId?: string; laneId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.getTasks(params.boardId, params.laneId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const fetchTask = createAsyncThunk(
  'task/fetchTask',
  async (id: string, { rejectWithValue }) => {
    try {
      return await taskService.getTask(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch task'
      );
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (
    data: {
      boardId: string;
      laneId: string;
      title: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: string;
      estimatedHours?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.createTask(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        priority?: TaskPriority;
        dueDate?: string;
        estimatedHours?: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.updateTask(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

export const moveTask = createAsyncThunk(
  'task/moveTask',
  async (
    { id, laneId }: { id: string; laneId: string },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.moveTask(id, { laneId });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to move task'
      );
    }
  }
);

export const createComment = createAsyncThunk(
  'task/createComment',
  async (
    { taskId, content }: { taskId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.createComment(taskId, { content });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create comment'
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  'task/deleteComment',
  async (
    { taskId, commentId }: { taskId: string; commentId: string },
    { rejectWithValue }
  ) => {
    try {
      await taskService.deleteComment(taskId, commentId);
      return commentId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete comment'
      );
    }
  }
);

export const createSubtask = createAsyncThunk(
  'task/createSubtask',
  async (
    { taskId, title, position }: { taskId: string; title: string; position: number },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.createSubtask(taskId, { title, position });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create subtask'
      );
    }
  }
);

export const updateSubtask = createAsyncThunk(
  'task/updateSubtask',
  async (
    {
      taskId,
      subtaskId,
      data,
    }: {
      taskId: string;
      subtaskId: string;
      data: { title?: string; isCompleted?: boolean; position?: number };
    },
    { rejectWithValue }
  ) => {
    try {
      return await taskService.updateSubtask(taskId, subtaskId, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update subtask'
      );
    }
  }
);

export const deleteSubtask = createAsyncThunk(
  'task/deleteSubtask',
  async (
    { taskId, subtaskId }: { taskId: string; subtaskId: string },
    { rejectWithValue }
  ) => {
    try {
      await taskService.deleteSubtask(taskId, subtaskId);
      return subtaskId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete subtask'
      );
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setCurrentTask: (state, action: PayloadAction<Task>) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Move task
    builder
      .addCase(moveTask.pending, (state) => {
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create comment
    builder
      .addCase(createComment.pending, (state) => {
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        if (state.currentTask?.comments) {
          state.currentTask.comments.push(action.payload);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete comment
    builder
      .addCase(deleteComment.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.currentTask?.comments) {
          state.currentTask.comments = state.currentTask.comments.filter(
            (c) => c.id !== action.payload
          );
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create subtask
    builder
      .addCase(createSubtask.pending, (state) => {
        state.error = null;
      })
      .addCase(createSubtask.fulfilled, (state, action: PayloadAction<Subtask>) => {
        if (state.currentTask?.subtasks) {
          state.currentTask.subtasks.push(action.payload);
        }
      })
      .addCase(createSubtask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update subtask
    builder
      .addCase(updateSubtask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSubtask.fulfilled, (state, action: PayloadAction<Subtask>) => {
        if (state.currentTask?.subtasks) {
          const index = state.currentTask.subtasks.findIndex(
            (s) => s.id === action.payload.id
          );
          if (index !== -1) {
            state.currentTask.subtasks[index] = action.payload;
          }
        }
      })
      .addCase(updateSubtask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete subtask
    builder
      .addCase(deleteSubtask.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteSubtask.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.currentTask?.subtasks) {
          state.currentTask.subtasks = state.currentTask.subtasks.filter(
            (s) => s.id !== action.payload
          );
        }
      })
      .addCase(deleteSubtask.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTask, setCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
