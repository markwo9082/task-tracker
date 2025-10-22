import prisma from '../config/database';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../utils/errors';
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from '../types/workspace.schemas';

export class WorkspaceService {
  async createWorkspace(userId: string, data: CreateWorkspaceInput) {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
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

    return workspace;
  }

  async getAllWorkspaces(userId: string) {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
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
        _count: {
          select: {
            boards: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workspaces;
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
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
        boards: {
          include: {
            _count: {
              select: {
                tasks: true,
                lanes: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    // Check if user is a member
    const isMember = workspace.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    return workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceInput
  ) {
    await this.checkWorkspacePermission(workspaceId, userId, ['OWNER', 'ADMIN']);

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
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

    return workspace;
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    await this.checkWorkspacePermission(workspaceId, userId, ['OWNER']);

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { message: 'Workspace deleted successfully' };
  }

  async addMember(
    workspaceId: string,
    userId: string,
    data: AddWorkspaceMemberInput
  ) {
    await this.checkWorkspacePermission(workspaceId, userId, ['OWNER', 'ADMIN']);

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!userToAdd) {
      throw new NotFoundError('User not found');
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: data.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this workspace');
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
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

  async removeMember(workspaceId: string, userId: string, memberUserId: string) {
    await this.checkWorkspacePermission(workspaceId, userId, ['OWNER', 'ADMIN']);

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Member not found in this workspace');
    }

    // Prevent removing the owner
    if (member.role === 'OWNER') {
      throw new BadRequestError('Cannot remove workspace owner');
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    memberUserId: string,
    data: UpdateWorkspaceMemberRoleInput
  ) {
    await this.checkWorkspacePermission(workspaceId, userId, ['OWNER']);

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Member not found in this workspace');
    }

    const updatedMember = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
      data: {
        role: data.role,
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

    return updatedMember;
  }

  async getMembers(workspaceId: string, userId: string) {
    await this.checkWorkspacePermission(workspaceId, userId, [
      'OWNER',
      'ADMIN',
      'MEMBER',
    ]);

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
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

  // Helper method to check workspace permissions
  private async checkWorkspacePermission(
    workspaceId: string,
    userId: string,
    allowedRoles: string[]
  ) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenError(
        'You do not have permission to perform this action'
      );
    }

    return member;
  }
}

export default new WorkspaceService();
