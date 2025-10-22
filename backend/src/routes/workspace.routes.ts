import { Router } from 'express';
import workspaceController from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  removeWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
} from '../types/workspace.schemas';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Workspace routes
router.post(
  '/',
  validate(createWorkspaceSchema),
  workspaceController.createWorkspace
);
router.get('/', workspaceController.getAllWorkspaces);
router.get(
  '/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    })
  ),
  workspaceController.getWorkspaceById
);
router.put(
  '/:id',
  validate(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);
router.delete(
  '/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    })
  ),
  workspaceController.deleteWorkspace
);

// Member routes
router.get(
  '/:id/members',
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    })
  ),
  workspaceController.getMembers
);
router.post(
  '/:id/members',
  validate(addWorkspaceMemberSchema),
  workspaceController.addMember
);
router.delete(
  '/:id/members/:userId',
  validate(removeWorkspaceMemberSchema),
  workspaceController.removeMember
);
router.put(
  '/:id/members/:userId/role',
  validate(updateWorkspaceMemberRoleSchema),
  workspaceController.updateMemberRole
);

export default router;
