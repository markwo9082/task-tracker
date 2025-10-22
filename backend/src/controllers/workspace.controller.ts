import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import workspaceService from '../services/workspace.service';
import { sendSuccess } from '../utils/response';
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from '../types/workspace.schemas';

export class WorkspaceController {
  async createWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: CreateWorkspaceInput = req.body;
      const workspace = await workspaceService.createWorkspace(userId, data);

      sendSuccess(res, workspace, 'Workspace created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllWorkspaces(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const workspaces = await workspaceService.getAllWorkspaces(userId);

      sendSuccess(res, workspaces);
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const workspace = await workspaceService.getWorkspaceById(id, userId);

      sendSuccess(res, workspace);
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: UpdateWorkspaceInput = req.body;
      const workspace = await workspaceService.updateWorkspace(id, userId, data);

      sendSuccess(res, workspace, 'Workspace updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await workspaceService.deleteWorkspace(id, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: AddWorkspaceMemberInput = req.body;
      const member = await workspaceService.addMember(id, userId, data);

      sendSuccess(res, member, 'Member added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, userId: memberUserId } = req.params;
      const result = await workspaceService.removeMember(id, userId, memberUserId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, userId: memberUserId } = req.params;
      const data: UpdateWorkspaceMemberRoleInput = req.body;
      const member = await workspaceService.updateMemberRole(
        id,
        userId,
        memberUserId,
        data
      );

      sendSuccess(res, member, 'Member role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const members = await workspaceService.getMembers(id, userId);

      sendSuccess(res, members);
    } catch (error) {
      next(error);
    }
  }
}

export default new WorkspaceController();
