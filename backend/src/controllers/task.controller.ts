import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import taskService from '../services/task.service';
import { sendSuccess } from '../utils/response';
import {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  AssignUserInput,
  AddLabelInput,
  CreateCommentInput,
  UpdateCommentInput,
  CreateAttachmentInput,
  CreateSubtaskInput,
  UpdateSubtaskInput,
} from '../types/task.schemas';

export class TaskController {
  // Task CRUD
  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: CreateTaskInput = req.body;
      const task = await taskService.createTask(userId, data);

      sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const task = await taskService.getTaskById(id, userId);

      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const boardId = req.query.boardId as string | undefined;
      const laneId = req.query.laneId as string | undefined;
      const tasks = await taskService.getAllTasks(userId, boardId, laneId);

      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: UpdateTaskInput = req.body;
      const task = await taskService.updateTask(id, userId, data);

      sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await taskService.deleteTask(id, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async moveTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: MoveTaskInput = req.body;
      const task = await taskService.moveTask(id, userId, data);

      sendSuccess(res, task, 'Task moved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Assignee management
  async assignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: AssignUserInput = req.body;
      const result = await taskService.assignUser(id, userId, data);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async unassignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, userId: unassignUserId } = req.params;
      const result = await taskService.unassignUser(id, userId, unassignUserId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Label management
  async addLabel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: AddLabelInput = req.body;
      const result = await taskService.addLabel(id, userId, data);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async removeLabel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, labelId } = req.params;
      const result = await taskService.removeLabel(id, userId, labelId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Comment management
  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: CreateCommentInput = req.body;
      const comment = await taskService.createComment(id, userId, data);

      sendSuccess(res, comment, 'Comment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, commentId } = req.params;
      const data: UpdateCommentInput = req.body;
      const comment = await taskService.updateComment(id, commentId, userId, data);

      sendSuccess(res, comment, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, commentId } = req.params;
      const result = await taskService.deleteComment(id, commentId, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Attachment management
  async createAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: CreateAttachmentInput = req.body;
      const attachment = await taskService.createAttachment(id, userId, data);

      sendSuccess(res, attachment, 'Attachment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, attachmentId } = req.params;
      const result = await taskService.deleteAttachment(id, attachmentId, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Subtask management
  async createSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: CreateSubtaskInput = req.body;
      const subtask = await taskService.createSubtask(id, userId, data);

      sendSuccess(res, subtask, 'Subtask created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, subtaskId } = req.params;
      const data: UpdateSubtaskInput = req.body;
      const subtask = await taskService.updateSubtask(id, subtaskId, userId, data);

      sendSuccess(res, subtask, 'Subtask updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, subtaskId } = req.params;
      const result = await taskService.deleteSubtask(id, subtaskId, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
