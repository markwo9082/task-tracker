import { z } from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    workspaceId: z.string().uuid('Invalid workspace ID'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
    createDefaultLanes: z.boolean().default(true),
  }),
});

export const updateBoardSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid board ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const addBoardMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid board ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
  }),
});

export const removeBoardMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid board ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const createLaneSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid board ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50),
    position: z.number().int().min(0).optional(),
    wipLimit: z.number().int().min(1).optional(),
  }),
});

export const updateLaneSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid board ID'),
    laneId: z.string().uuid('Invalid lane ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50).optional(),
    position: z.number().int().min(0).optional(),
    wipLimit: z.number().int().min(1).nullable().optional(),
  }),
});

export const reorderLanesSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid board ID'),
  }),
  body: z.object({
    lanes: z.array(
      z.object({
        id: z.string().uuid(),
        position: z.number().int().min(0),
      })
    ),
  }),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>['body'];
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>['body'];
export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>['body'];
export type CreateLaneInput = z.infer<typeof createLaneSchema>['body'];
export type UpdateLaneInput = z.infer<typeof updateLaneSchema>['body'];
export type ReorderLanesInput = z.infer<typeof reorderLanesSchema>['body'];
