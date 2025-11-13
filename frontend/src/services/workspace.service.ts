import api from './api';
import { ApiResponse, Workspace, WorkspaceMember, WorkspaceMemberRole } from '../types';

export interface CreateWorkspaceData {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
}

export interface AddWorkspaceMemberData {
  userId: string;
  role: WorkspaceMemberRole;
}

export const workspaceService = {
  // Get all user's workspaces
  getAll: async (): Promise<Workspace[]> => {
    const response = await api.get<ApiResponse<Workspace[]>>('/workspaces');
    return response.data.data;
  },

  // Get workspace by ID
  getById: async (id: string): Promise<Workspace> => {
    const response = await api.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
    return response.data.data;
  },

  // Create workspace
  create: async (data: CreateWorkspaceData): Promise<Workspace> => {
    const response = await api.post<ApiResponse<Workspace>>('/workspaces', data);
    return response.data.data;
  },

  // Update workspace
  update: async (id: string, data: UpdateWorkspaceData): Promise<Workspace> => {
    const response = await api.put<ApiResponse<Workspace>>(`/workspaces/${id}`, data);
    return response.data.data;
  },

  // Delete workspace
  delete: async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`);
  },

  // Get workspace members
  getMembers: async (id: string): Promise<WorkspaceMember[]> => {
    const response = await api.get<ApiResponse<WorkspaceMember[]>>(`/workspaces/${id}/members`);
    return response.data.data;
  },

  // Add member to workspace
  addMember: async (id: string, data: AddWorkspaceMemberData): Promise<WorkspaceMember> => {
    const response = await api.post<ApiResponse<WorkspaceMember>>(`/workspaces/${id}/members`, data);
    return response.data.data;
  },

  // Remove member from workspace
  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  // Update member role
  updateMemberRole: async (
    workspaceId: string,
    userId: string,
    role: WorkspaceMemberRole
  ): Promise<WorkspaceMember> => {
    const response = await api.put<ApiResponse<WorkspaceMember>>(
      `/workspaces/${workspaceId}/members/${userId}/role`,
      { role }
    );
    return response.data.data;
  },
};

export default workspaceService;
