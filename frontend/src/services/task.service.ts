import api from './api';
import { ApiResponse, Task, TaskPriority, Comment, Attachment, Subtask } from '../types';

export interface CreateTaskData {
  boardId: string;
  laneId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  position?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  position?: number;
}

export interface MoveTaskData {
  laneId: string;
  position?: number;
}

export interface CreateCommentData {
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CreateAttachmentData {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export interface CreateSubtaskData {
  title: string;
  position?: number;
}

export interface UpdateSubtaskData {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

export const taskService = {
  // Get all tasks (optionally filtered by board/lane)
  getAll: async (boardId?: string, laneId?: string): Promise<Task[]> => {
    const params: { boardId?: string; laneId?: string } = {};
    if (boardId) params.boardId = boardId;
    if (laneId) params.laneId = laneId;
    const response = await api.get<ApiResponse<Task[]>>('/tasks', { params });
    return response.data.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  // Create task
  create: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data;
  },

  // Update task
  update: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data;
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Move task to different lane
  move: async (id: string, data: MoveTaskData): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${id}/move`, data);
    return response.data.data;
  },

  // Assignee management
  addAssignee: async (taskId: string, userId: string): Promise<void> => {
    await api.post(`/tasks/${taskId}/assignees`, { userId });
  },

  removeAssignee: async (taskId: string, userId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/assignees/${userId}`);
  },

  // Label management
  addLabel: async (taskId: string, labelId: string): Promise<void> => {
    await api.post(`/tasks/${taskId}/labels`, { labelId });
  },

  removeLabel: async (taskId: string, labelId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/labels/${labelId}`);
  },

  // Comment management
  createComment: async (taskId: string, data: CreateCommentData): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, data);
    return response.data.data;
  },

  updateComment: async (
    taskId: string,
    commentId: string,
    data: UpdateCommentData
  ): Promise<Comment> => {
    const response = await api.put<ApiResponse<Comment>>(
      `/tasks/${taskId}/comments/${commentId}`,
      data
    );
    return response.data.data;
  },

  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Attachment management
  createAttachment: async (taskId: string, data: CreateAttachmentData): Promise<Attachment> => {
    const response = await api.post<ApiResponse<Attachment>>(`/tasks/${taskId}/attachments`, data);
    return response.data.data;
  },

  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },

  // Subtask management
  createSubtask: async (taskId: string, data: CreateSubtaskData): Promise<Subtask> => {
    const response = await api.post<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks`, data);
    return response.data.data;
  },

  updateSubtask: async (
    taskId: string,
    subtaskId: string,
    data: UpdateSubtaskData
  ): Promise<Subtask> => {
    const response = await api.put<ApiResponse<Subtask>>(
      `/tasks/${taskId}/subtasks/${subtaskId}`,
      data
    );
    return response.data.data;
  },

  deleteSubtask: async (taskId: string, subtaskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  },
};

export default taskService;
