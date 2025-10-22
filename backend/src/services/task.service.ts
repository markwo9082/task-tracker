import prisma from '../config/database';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../utils/errors';
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

export class TaskService {
  // Helper method to check if user has access to the board
  private async checkBoardAccess(boardId: string, userId: string) {
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

    return member;
  }

  // Helper method to check if user can modify a task
  private async checkTaskAccess(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (task.board.members.length === 0) {
      throw new ForbiddenError('You do not have access to this task');
    }

    return task;
  }

  async createTask(userId: string, data: CreateTaskInput) {
    // Check if user has access to the board
    const member = await this.checkBoardAccess(data.boardId, userId);

    if (member.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot create tasks');
    }

    // Verify lane exists and belongs to board
    const lane = await prisma.lane.findUnique({
      where: { id: data.laneId },
    });

    if (!lane || lane.boardId !== data.boardId) {
      throw new BadRequestError('Lane not found in this board');
    }

    // If position not provided, add to end of lane
    let position = data.position;
    if (position === undefined) {
      const maxPosition = await prisma.task.aggregate({
        where: { laneId: data.laneId },
        _max: { position: true },
      });
      position = (maxPosition._max.position ?? -1) + 1;
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        boardId: data.boardId,
        laneId: data.laneId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours,
        position,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
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
    });

    return task;
  }

  async getTaskById(taskId: string, userId: string) {
    await this.checkTaskAccess(taskId, userId);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        lane: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        attachments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        subtasks: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return task;
  }

  async getAllTasks(userId: string, boardId?: string, laneId?: string) {
    const where: any = {
      board: {
        members: {
          some: { userId },
        },
      },
    };

    if (boardId) {
      where.boardId = boardId;
    }

    if (laneId) {
      where.laneId = laneId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
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
      orderBy: {
        position: 'asc',
      },
    });

    return tasks;
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskInput) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot update tasks');
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.estimatedHours !== undefined) {
      updateData.estimatedHours = data.estimatedHours;
    }
    if (data.position !== undefined) updateData.position = data.position;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
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
    });

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot delete tasks');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }

  async moveTask(taskId: string, userId: string, data: MoveTaskInput) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot move tasks');
    }

    // Verify lane exists and belongs to same board
    const lane = await prisma.lane.findUnique({
      where: { id: data.laneId },
    });

    if (!lane || lane.boardId !== task.boardId) {
      throw new BadRequestError('Lane not found in this board');
    }

    // Check WIP limit if moving to a different lane
    if (data.laneId !== task.laneId && lane.wipLimit) {
      const taskCount = await prisma.task.count({
        where: { laneId: data.laneId },
      });

      if (taskCount >= lane.wipLimit) {
        throw new BadRequestError(
          `Cannot move task. Lane has reached WIP limit of ${lane.wipLimit}`
        );
      }
    }

    const movedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        laneId: data.laneId,
        position: data.position,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
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
    });

    return movedTask;
  }

  // Assignee management
  async assignUser(taskId: string, userId: string, data: AssignUserInput) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot assign users');
    }

    // Check if user to assign is a member of the board
    const userToAssign = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId: data.userId,
        },
      },
    });

    if (!userToAssign) {
      throw new BadRequestError('User is not a member of this board');
    }

    // Check if already assigned
    const existingAssignment = await prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: data.userId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictError('User is already assigned to this task');
    }

    await prisma.taskAssignee.create({
      data: {
        taskId,
        userId: data.userId,
      },
    });

    return { message: 'User assigned successfully' };
  }

  async unassignUser(taskId: string, userId: string, unassignUserId: string) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot unassign users');
    }

    const assignment = await prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: unassignUserId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundError('User is not assigned to this task');
    }

    await prisma.taskAssignee.delete({
      where: {
        taskId_userId: {
          taskId,
          userId: unassignUserId,
        },
      },
    });

    return { message: 'User unassigned successfully' };
  }

  // Label management
  async addLabel(taskId: string, userId: string, data: AddLabelInput) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot add labels');
    }

    // Check if label exists and belongs to the same workspace
    const label = await prisma.label.findUnique({
      where: { id: data.labelId },
      include: {
        workspace: {
          include: {
            boards: {
              where: { id: task.boardId },
            },
          },
        },
      },
    });

    if (!label || label.workspace.boards.length === 0) {
      throw new BadRequestError('Label not found in this workspace');
    }

    // Check if label is already added
    const existingLabel = await prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId: data.labelId,
        },
      },
    });

    if (existingLabel) {
      throw new ConflictError('Label already added to this task');
    }

    await prisma.taskLabel.create({
      data: {
        taskId,
        labelId: data.labelId,
      },
    });

    return { message: 'Label added successfully' };
  }

  async removeLabel(taskId: string, userId: string, labelId: string) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot remove labels');
    }

    const taskLabel = await prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    if (!taskLabel) {
      throw new NotFoundError('Label not found on this task');
    }

    await prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    return { message: 'Label removed successfully' };
  }

  // Comment management
  async createComment(taskId: string, userId: string, data: CreateCommentInput) {
    await this.checkTaskAccess(taskId, userId);

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return comment;
  }

  async updateComment(
    taskId: string,
    commentId: string,
    userId: string,
    data: UpdateCommentInput
  ) {
    await this.checkTaskAccess(taskId, userId);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.taskId !== taskId) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updatedComment;
  }

  async deleteComment(taskId: string, commentId: string, userId: string) {
    await this.checkTaskAccess(taskId, userId);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.taskId !== taskId) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }

  // Attachment management
  async createAttachment(taskId: string, userId: string, data: CreateAttachmentInput) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot add attachments');
    }

    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        uploadedBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return attachment;
  }

  async deleteAttachment(taskId: string, attachmentId: string, userId: string) {
    const task = await this.checkTaskAccess(taskId, userId);

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.taskId !== taskId) {
      throw new NotFoundError('Attachment not found');
    }

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    // Only the uploader or admin can delete
    if (attachment.uploadedBy !== userId && member?.role !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own attachments');
    }

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment deleted successfully' };
  }

  // Subtask management
  async createSubtask(taskId: string, userId: string, data: CreateSubtaskInput) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot create subtasks');
    }

    // If position not provided, add to end
    let position = data.position;
    if (position === undefined) {
      const maxPosition = await prisma.subtask.aggregate({
        where: { taskId },
        _max: { position: true },
      });
      position = (maxPosition._max.position ?? -1) + 1;
    }

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title: data.title,
        position,
      },
    });

    return subtask;
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    userId: string,
    data: UpdateSubtaskInput
  ) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot update subtasks');
    }

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask || subtask.taskId !== taskId) {
      throw new NotFoundError('Subtask not found');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;
    if (data.position !== undefined) updateData.position = data.position;

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData,
    });

    return updatedSubtask;
  }

  async deleteSubtask(taskId: string, subtaskId: string, userId: string) {
    const task = await this.checkTaskAccess(taskId, userId);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.boardId,
          userId,
        },
      },
    });

    if (member?.role === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot delete subtasks');
    }

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask || subtask.taskId !== taskId) {
      throw new NotFoundError('Subtask not found');
    }

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    return { message: 'Subtask deleted successfully' };
  }
}

export default new TaskService();
