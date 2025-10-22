import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import boardService from '../services/board.service';
import { sendSuccess } from '../utils/response';
import {
  CreateBoardInput,
  UpdateBoardInput,
  AddBoardMemberInput,
  CreateLaneInput,
  UpdateLaneInput,
  ReorderLanesInput,
} from '../types/board.schemas';

export class BoardController {
  async createBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: CreateBoardInput = req.body;
      const board = await boardService.createBoard(userId, data);

      sendSuccess(res, board, 'Board created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllBoards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const workspaceId = req.query.workspaceId as string | undefined;
      const boards = await boardService.getAllBoards(userId, workspaceId);

      sendSuccess(res, boards);
    } catch (error) {
      next(error);
    }
  }

  async getBoardById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const board = await boardService.getBoardById(id, userId);

      sendSuccess(res, board);
    } catch (error) {
      next(error);
    }
  }

  async updateBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: UpdateBoardInput = req.body;
      const board = await boardService.updateBoard(id, userId, data);

      sendSuccess(res, board, 'Board updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await boardService.deleteBoard(id, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: AddBoardMemberInput = req.body;
      const member = await boardService.addMember(id, userId, data);

      sendSuccess(res, member, 'Member added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, userId: memberUserId } = req.params;
      const result = await boardService.removeMember(id, userId, memberUserId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const members = await boardService.getMembers(id, userId);

      sendSuccess(res, members);
    } catch (error) {
      next(error);
    }
  }

  // Lane methods
  async createLane(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: CreateLaneInput = req.body;
      const lane = await boardService.createLane(id, userId, data);

      sendSuccess(res, lane, 'Lane created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateLane(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, laneId } = req.params;
      const data: UpdateLaneInput = req.body;
      const lane = await boardService.updateLane(id, laneId, userId, data);

      sendSuccess(res, lane, 'Lane updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteLane(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, laneId } = req.params;
      const result = await boardService.deleteLane(id, laneId, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async reorderLanes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: ReorderLanesInput = req.body;
      const result = await boardService.reorderLanes(id, userId, data);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new BoardController();
