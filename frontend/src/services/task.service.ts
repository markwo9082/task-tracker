import api from './api';
import { Task, Comment, Attachment, Subtask, TaskPriority } from '../types';

interface CreateTaskData {
  boardId: string;
  laneId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
}

interface MoveTaskData {
  laneId: string;
}

interface CreateCommentData {
  content: string;
}

interface UpdateCommentData {
  content: string;
}

interface CreateAttachmentData {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

interface CreateSubtaskData {
  title: string;
  position: number;
}

interface UpdateSubtaskData {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

const taskService = {
  // Get all tasks
  getTasks: async (boardId?: string, laneId?: string): Promise<Task[]> => {
    let url = '/tasks';
    const params = new URLSearchParams();
    if (boardId) params.append('boardId', boardId);
    if (laneId) params.append('laneId', laneId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await api.get(url);
    return response.data.data;
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  // Create task
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data.data;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Move task
  moveTask: async (id: string, data: MoveTaskData): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/move`, data);
    return response.data.data;
  },

  // Assign user
  assignUser: async (taskId: string, userId: string): Promise<void> => {
    await api.post(`/tasks/${taskId}/assignees`, { userId });
  },

  // Unassign user
  unassignUser: async (taskId: string, userId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/assignees/${userId}`);
  },

  // Add label
  addLabel: async (taskId: string, labelId: string): Promise<void> => {
    await api.post(`/tasks/${taskId}/labels`, { labelId });
  },

  // Remove label
  removeLabel: async (taskId: string, labelId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/labels/${labelId}`);
  },

  // Comments
  createComment: async (
    taskId: string,
    data: CreateCommentData
  ): Promise<Comment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return response.data.data;
  },

  updateComment: async (
    taskId: string,
    commentId: string,
    data: UpdateCommentData
  ): Promise<Comment> => {
    const response = await api.put(
      `/tasks/${taskId}/comments/${commentId}`,
      data
    );
    return response.data.data;
  },

  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Attachments
  createAttachment: async (
    taskId: string,
    data: CreateAttachmentData
  ): Promise<Attachment> => {
    const response = await api.post(`/tasks/${taskId}/attachments`, data);
    return response.data.data;
  },

  deleteAttachment: async (
    taskId: string,
    attachmentId: string
  ): Promise<void> => {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },

  // Subtasks
  createSubtask: async (
    taskId: string,
    data: CreateSubtaskData
  ): Promise<Subtask> => {
    const response = await api.post(`/tasks/${taskId}/subtasks`, data);
    return response.data.data;
  },

  updateSubtask: async (
    taskId: string,
    subtaskId: string,
    data: UpdateSubtaskData
  ): Promise<Subtask> => {
    const response = await api.put(
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
