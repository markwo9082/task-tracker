import api from './api';
import { Workspace, WorkspaceMember, WorkspaceMemberRole } from '../types';

interface CreateWorkspaceData {
  name: string;
  description?: string;
}

interface UpdateWorkspaceData {
  name?: string;
  description?: string;
}

interface AddMemberData {
  userId: string;
  role: WorkspaceMemberRole;
}

const workspaceService = {
  // Get all workspaces
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get('/workspaces');
    return response.data.data;
  },

  // Get workspace by ID
  getWorkspace: async (id: string): Promise<Workspace> => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data.data;
  },

  // Create workspace
  createWorkspace: async (data: CreateWorkspaceData): Promise<Workspace> => {
    const response = await api.post('/workspaces', data);
    return response.data.data;
  },

  // Update workspace
  updateWorkspace: async (
    id: string,
    data: UpdateWorkspaceData
  ): Promise<Workspace> => {
    const response = await api.put(`/workspaces/${id}`, data);
    return response.data.data;
  },

  // Delete workspace
  deleteWorkspace: async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`);
  },

  // Get workspace members
  getMembers: async (id: string): Promise<WorkspaceMember[]> => {
    const response = await api.get(`/workspaces/${id}/members`);
    return response.data.data;
  },

  // Add member
  addMember: async (id: string, data: AddMemberData): Promise<WorkspaceMember> => {
    const response = await api.post(`/workspaces/${id}/members`, data);
    return response.data.data;
  },

  // Remove member
  removeMember: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/workspaces/${id}/members/${userId}`);
  },

  // Update member role
  updateMemberRole: async (
    id: string,
    userId: string,
    role: WorkspaceMemberRole
  ): Promise<WorkspaceMember> => {
    const response = await api.put(`/workspaces/${id}/members/${userId}/role`, {
      role,
    });
    return response.data.data;
  },
};

export default workspaceService;
