import prisma from '../config/database';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../utils/errors';
import {
  CreateBoardInput,
  UpdateBoardInput,
  AddBoardMemberInput,
  CreateLaneInput,
  UpdateLaneInput,
  ReorderLanesInput,
} from '../types/board.schemas';

const DEFAULT_LANES = [
  { name: 'To Do', position: 0 },
  { name: 'In Progress', position: 1 },
  { name: 'Review', position: 2 },
  { name: 'Done', position: 3 },
];

export class BoardService {
  async createBoard(userId: string, data: CreateBoardInput) {
    // Check if user is a member of the workspace
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: data.workspaceId,
          userId,
        },
      },
    });

    if (!workspaceMember) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    // Create board with optional default lanes
    const board = await prisma.board.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        description: data.description,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
        ...(data.createDefaultLanes && {
          lanes: {
            create: DEFAULT_LANES,
          },
        }),
      },
      include: {
        lanes: {
          orderBy: {
            position: 'asc',
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return board;
  }

  async getAllBoards(userId: string, workspaceId?: string) {
    const where: any = {
      members: {
        some: {
          userId,
        },
      },
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const boards = await prisma.board.findMany({
      where,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        lanes: {
          orderBy: {
            position: 'asc',
          },
          include: {
            _count: {
              select: {
                tasks: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return boards;
  }

  async getBoardById(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        lanes: {
          orderBy: {
            position: 'asc',
          },
          include: {
            tasks: {
              orderBy: {
                position: 'asc',
              },
              include: {
                assignees: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
                labels: {
                  include: {
                    label: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    attachments: true,
                    subtasks: true,
                  },
                },
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    // Check if user has access
    const isMember = board.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this board');
    }

    return board;
  }

  async updateBoard(boardId: string, userId: string, data: UpdateBoardInput) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN']);

    const board = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        lanes: {
          orderBy: {
            position: 'asc',
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return board;
  }

  async deleteBoard(boardId: string, userId: string) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN']);

    await prisma.board.delete({
      where: { id: boardId },
    });

    return { message: 'Board deleted successfully' };
  }

  async addMember(boardId: string, userId: string, data: AddBoardMemberInput) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN']);

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!userToAdd) {
      throw new NotFoundError('User not found');
    }

    // Check if user is already a member
    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: data.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this board');
    }

    const member = await prisma.boardMember.create({
      data: {
        boardId,
        userId: data.userId,
        role: data.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return member;
  }

  async removeMember(boardId: string, userId: string, memberUserId: string) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN']);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Member not found in this board');
    }

    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async getMembers(boardId: string, userId: string) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN', 'MEMBER', 'VIEWER']);

    const members = await prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members;
  }

  // Lane management
  async createLane(boardId: string, userId: string, data: CreateLaneInput) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN', 'MEMBER']);

    // If position not provided, add to end
    if (data.position === undefined) {
      const maxPosition = await prisma.lane.aggregate({
        where: { boardId },
        _max: { position: true },
      });
      data.position = (maxPosition._max.position ?? -1) + 1;
    }

    const lane = await prisma.lane.create({
      data: {
        boardId,
        name: data.name,
        position: data.position,
        wipLimit: data.wipLimit,
      },
    });

    return lane;
  }

  async updateLane(
    boardId: string,
    laneId: string,
    userId: string,
    data: UpdateLaneInput
  ) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN', 'MEMBER']);

    // Verify lane belongs to board
    const lane = await prisma.lane.findUnique({
      where: { id: laneId },
    });

    if (!lane || lane.boardId !== boardId) {
      throw new NotFoundError('Lane not found in this board');
    }

    const updatedLane = await prisma.lane.update({
      where: { id: laneId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.wipLimit !== undefined && { wipLimit: data.wipLimit }),
      },
    });

    return updatedLane;
  }

  async deleteLane(boardId: string, laneId: string, userId: string) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN']);

    // Verify lane belongs to board
    const lane = await prisma.lane.findUnique({
      where: { id: laneId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!lane || lane.boardId !== boardId) {
      throw new NotFoundError('Lane not found in this board');
    }

    if (lane._count.tasks > 0) {
      throw new BadRequestError(
        'Cannot delete lane with tasks. Move or delete tasks first.'
      );
    }

    await prisma.lane.delete({
      where: { id: laneId },
    });

    return { message: 'Lane deleted successfully' };
  }

  async reorderLanes(boardId: string, userId: string, data: ReorderLanesInput) {
    await this.checkBoardPermission(boardId, userId, ['ADMIN', 'MEMBER']);

    // Update all lanes in a transaction
    await prisma.$transaction(
      data.lanes.map((lane) =>
        prisma.lane.update({
          where: { id: lane.id },
          data: { position: lane.position },
        })
      )
    );

    return { message: 'Lanes reordered successfully' };
  }

  // Helper method to check board permissions
  private async checkBoardPermission(
    boardId: string,
    userId: string,
    allowedRoles: string[]
  ) {
    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError('You do not have access to this board');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenError(
        'You do not have permission to perform this action'
      );
    }

    return member;
  }
}

export default new BoardService();
