import api from './api';
import { Board, BoardMember, BoardMemberRole, Lane } from '../types';

interface CreateBoardData {
  workspaceId: string;
  name: string;
  description?: string;
  createDefaultLanes?: boolean;
}

interface UpdateBoardData {
  name?: string;
  description?: string;
}

interface CreateLaneData {
  name: string;
  position: number;
  wipLimit?: number;
}

interface UpdateLaneData {
  name?: string;
  position?: number;
  wipLimit?: number;
}

interface ReorderLanesData {
  laneIds: string[];
}

interface AddBoardMemberData {
  userId: string;
  role: BoardMemberRole;
}

const boardService = {
  // Get all boards
  getBoards: async (workspaceId?: string): Promise<Board[]> => {
    const url = workspaceId ? `/boards?workspaceId=${workspaceId}` : '/boards';
    const response = await api.get(url);
    return response.data.data;
  },

  // Get board by ID
  getBoard: async (id: string): Promise<Board> => {
    const response = await api.get(`/boards/${id}`);
    return response.data.data;
  },

  // Create board
  createBoard: async (data: CreateBoardData): Promise<Board> => {
    const response = await api.post('/boards', data);
    return response.data.data;
  },

  // Update board
  updateBoard: async (id: string, data: UpdateBoardData): Promise<Board> => {
    const response = await api.put(`/boards/${id}`, data);
    return response.data.data;
  },

  // Delete board
  deleteBoard: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },

  // Get board members
  getMembers: async (id: string): Promise<BoardMember[]> => {
    const response = await api.get(`/boards/${id}/members`);
    return response.data.data;
  },

  // Add board member
  addMember: async (id: string, data: AddBoardMemberData): Promise<BoardMember> => {
    const response = await api.post(`/boards/${id}/members`, data);
    return response.data.data;
  },

  // Remove board member
  removeMember: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/boards/${id}/members/${userId}`);
  },

  // Create lane
  createLane: async (boardId: string, data: CreateLaneData): Promise<Lane> => {
    const response = await api.post(`/boards/${boardId}/lanes`, data);
    return response.data.data;
  },

  // Update lane
  updateLane: async (
    boardId: string,
    laneId: string,
    data: UpdateLaneData
  ): Promise<Lane> => {
    const response = await api.put(`/boards/${boardId}/lanes/${laneId}`, data);
    return response.data.data;
  },

  // Delete lane
  deleteLane: async (boardId: string, laneId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/lanes/${laneId}`);
  },

  // Reorder lanes
  reorderLanes: async (
    boardId: string,
    data: ReorderLanesData
  ): Promise<Lane[]> => {
    const response = await api.post(`/boards/${boardId}/lanes/reorder`, data);
    return response.data.data;
  },
};

export default boardService;
