import api from './api';
import { ApiResponse, Board, BoardMember, BoardMemberRole, Lane } from '../types';

export interface CreateBoardData {
  workspaceId: string;
  name: string;
  description?: string;
  createDefaultLanes?: boolean;
}

export interface UpdateBoardData {
  name?: string;
  description?: string;
}

export interface AddBoardMemberData {
  userId: string;
  role: BoardMemberRole;
}

export interface CreateLaneData {
  name: string;
  position?: number;
  wipLimit?: number;
}

export interface UpdateLaneData {
  name?: string;
  position?: number;
  wipLimit?: number;
}

export interface ReorderLanesData {
  laneIds: string[];
}

export const boardService = {
  // Get all boards (optionally filtered by workspace)
  getAll: async (workspaceId?: string): Promise<Board[]> => {
    const params = workspaceId ? { workspaceId } : {};
    const response = await api.get<ApiResponse<Board[]>>('/boards', { params });
    return response.data.data;
  },

  // Get board by ID with lanes and tasks
  getById: async (id: string): Promise<Board> => {
    const response = await api.get<ApiResponse<Board>>(`/boards/${id}`);
    return response.data.data;
  },

  // Create board
  create: async (data: CreateBoardData): Promise<Board> => {
    const response = await api.post<ApiResponse<Board>>('/boards', data);
    return response.data.data;
  },

  // Update board
  update: async (id: string, data: UpdateBoardData): Promise<Board> => {
    const response = await api.put<ApiResponse<Board>>(`/boards/${id}`, data);
    return response.data.data;
  },

  // Delete board
  delete: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },

  // Get board members
  getMembers: async (id: string): Promise<BoardMember[]> => {
    const response = await api.get<ApiResponse<BoardMember[]>>(`/boards/${id}/members`);
    return response.data.data;
  },

  // Add member to board
  addMember: async (id: string, data: AddBoardMemberData): Promise<BoardMember> => {
    const response = await api.post<ApiResponse<BoardMember>>(`/boards/${id}/members`, data);
    return response.data.data;
  },

  // Remove member from board
  removeMember: async (boardId: string, userId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/members/${userId}`);
  },

  // Lane management
  createLane: async (boardId: string, data: CreateLaneData): Promise<Lane> => {
    const response = await api.post<ApiResponse<Lane>>(`/boards/${boardId}/lanes`, data);
    return response.data.data;
  },

  updateLane: async (boardId: string, laneId: string, data: UpdateLaneData): Promise<Lane> => {
    const response = await api.put<ApiResponse<Lane>>(`/boards/${boardId}/lanes/${laneId}`, data);
    return response.data.data;
  },

  deleteLane: async (boardId: string, laneId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/lanes/${laneId}`);
  },

  reorderLanes: async (boardId: string, data: ReorderLanesData): Promise<Lane[]> => {
    const response = await api.post<ApiResponse<Lane[]>>(`/boards/${boardId}/lanes/reorder`, data);
    return response.data.data;
  },
};

export default boardService;
