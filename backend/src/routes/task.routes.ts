import { Router } from 'express';
import taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignUserSchema,
  unassignUserSchema,
  addLabelSchema,
  removeLabelSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  createAttachmentSchema,
  deleteAttachmentSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
  deleteSubtaskSchema,
} from '../types/task.schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task CRUD
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Move task
router.post('/:id/move', validate(moveTaskSchema), taskController.moveTask);

// Assignee management
router.post('/:id/assignees', validate(assignUserSchema), taskController.assignUser);
router.delete('/:id/assignees/:userId', validate(unassignUserSchema), taskController.unassignUser);

// Label management
router.post('/:id/labels', validate(addLabelSchema), taskController.addLabel);
router.delete('/:id/labels/:labelId', validate(removeLabelSchema), taskController.removeLabel);

// Comment management
router.post('/:id/comments', validate(createCommentSchema), taskController.createComment);
router.put('/:id/comments/:commentId', validate(updateCommentSchema), taskController.updateComment);
router.delete('/:id/comments/:commentId', validate(deleteCommentSchema), taskController.deleteComment);

// Attachment management
router.post('/:id/attachments', validate(createAttachmentSchema), taskController.createAttachment);
router.delete('/:id/attachments/:attachmentId', validate(deleteAttachmentSchema), taskController.deleteAttachment);

// Subtask management
router.post('/:id/subtasks', validate(createSubtaskSchema), taskController.createSubtask);
router.put('/:id/subtasks/:subtaskId', validate(updateSubtaskSchema), taskController.updateSubtask);
router.delete('/:id/subtasks/:subtaskId', validate(deleteSubtaskSchema), taskController.deleteSubtask);

export default router;
