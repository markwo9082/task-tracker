import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const addWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER'),
  }),
});

export const removeWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
  }),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>['body'];
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>['body'];
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>['body'];
export type UpdateWorkspaceMemberRoleInput = z.infer<typeof updateWorkspaceMemberRoleSchema>['body'];
