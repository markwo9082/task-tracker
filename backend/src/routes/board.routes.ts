import { Router } from 'express';
import boardController from '../controllers/board.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createBoardSchema,
  updateBoardSchema,
  addBoardMemberSchema,
  removeBoardMemberSchema,
  createLaneSchema,
  updateLaneSchema,
  reorderLanesSchema,
} from '../types/board.schemas';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Board routes
router.post('/', validate(createBoardSchema), boardController.createBoard);
router.get('/', boardController.getAllBoards);
router.get(
  '/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    })
  ),
  boardController.getBoardById
);
router.put('/:id', validate(updateBoardSchema), boardController.updateBoard);
router.delete(
  '/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    })
  ),
  boardController.deleteBoard
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
  boardController.getMembers
);
router.post('/:id/members', validate(addBoardMemberSchema), boardController.addMember);
router.delete(
  '/:id/members/:userId',
  validate(removeBoardMemberSchema),
  boardController.removeMember
);

// Lane routes
router.post('/:id/lanes', validate(createLaneSchema), boardController.createLane);
router.put('/:id/lanes/:laneId', validate(updateLaneSchema), boardController.updateLane);
router.delete(
  '/:id/lanes/:laneId',
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
        laneId: z.string().uuid(),
      }),
    })
  ),
  boardController.deleteLane
);
router.post('/:id/lanes/reorder', validate(reorderLanesSchema), boardController.reorderLanes);

export default router;
