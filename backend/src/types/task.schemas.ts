import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    boardId: z.string().uuid('Invalid board ID'),
    laneId: z.string().uuid('Invalid lane ID'),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(5000).optional(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().positive().optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    estimatedHours: z.number().positive().nullable().optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const moveTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    laneId: z.string().uuid('Invalid lane ID'),
    position: z.number().int().min(0),
  }),
});

export const assignUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const unassignUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const addLabelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    labelId: z.string().uuid('Invalid label ID'),
  }),
});

export const removeLabelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
    labelId: z.string().uuid('Invalid label ID'),
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(5000),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
    commentId: z.string().uuid('Invalid comment ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(5000),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
    commentId: z.string().uuid('Invalid comment ID'),
  }),
});

export const createAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Invalid file URL'),
    fileSize: z.number().int().positive('File size must be positive'),
  }),
});

export const deleteAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
    attachmentId: z.string().uuid('Invalid attachment ID'),
  }),
});

export const createSubtaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Subtask title is required').max(200),
    position: z.number().int().min(0).optional(),
  }),
});

export const updateSubtaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
    subtaskId: z.string().uuid('Invalid subtask ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Subtask title is required').max(200).optional(),
    isCompleted: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const deleteSubtaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
    subtaskId: z.string().uuid('Invalid subtask ID'),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type MoveTaskInput = z.infer<typeof moveTaskSchema>['body'];
export type AssignUserInput = z.infer<typeof assignUserSchema>['body'];
export type AddLabelInput = z.infer<typeof addLabelSchema>['body'];
export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>['body'];
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>['body'];
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>['body'];
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>['body'];
