import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john@demo.com' },
    update: {},
    create: {
      email: 'john@demo.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'ADMIN',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@demo.com' },
    update: {},
    create: {
      email: 'jane@demo.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: 'MEMBER',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'bob@demo.com' },
    update: {},
    create: {
      email: 'bob@demo.com',
      password: hashedPassword,
      name: 'Bob Johnson',
      role: 'MEMBER',
    },
  });

  console.log('✓ Created demo users');

  // Create a demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      description: 'A sample workspace for testing',
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: 'OWNER' },
          { userId: user2.id, role: 'ADMIN' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✓ Created demo workspace');

  // Create labels
  const labels = await Promise.all([
    prisma.label.create({
      data: { workspaceId: workspace.id, name: 'Bug', color: '#ef4444' },
    }),
    prisma.label.create({
      data: { workspaceId: workspace.id, name: 'Feature', color: '#3b82f6' },
    }),
    prisma.label.create({
      data: { workspaceId: workspace.id, name: 'Enhancement', color: '#10b981' },
    }),
    prisma.label.create({
      data: { workspaceId: workspace.id, name: 'Documentation', color: '#8b5cf6' },
    }),
    prisma.label.create({
      data: { workspaceId: workspace.id, name: 'Urgent', color: '#f59e0b' },
    }),
  ]);

  console.log('✓ Created labels');

  // Create a demo board
  const board = await prisma.board.create({
    data: {
      workspaceId: workspace.id,
      name: 'Product Development',
      description: 'Main product development board',
      members: {
        create: [
          { userId: user1.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✓ Created demo board');

  // Create lanes
  const todoLane = await prisma.lane.create({
    data: {
      boardId: board.id,
      name: 'To Do',
      position: 0,
      wipLimit: null,
    },
  });

  const inProgressLane = await prisma.lane.create({
    data: {
      boardId: board.id,
      name: 'In Progress',
      position: 1,
      wipLimit: 3,
    },
  });

  const reviewLane = await prisma.lane.create({
    data: {
      boardId: board.id,
      name: 'Review',
      position: 2,
      wipLimit: 2,
    },
  });

  const doneLane = await prisma.lane.create({
    data: {
      boardId: board.id,
      name: 'Done',
      position: 3,
      wipLimit: null,
    },
  });

  console.log('✓ Created lanes');

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      boardId: board.id,
      laneId: todoLane.id,
      title: 'Design user authentication flow',
      description: 'Create mockups and wireframes for the login and registration process',
      priority: 'HIGH',
      position: 0,
      createdById: user1.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      assignees: {
        create: [{ userId: user2.id }],
      },
      labels: {
        create: [{ labelId: labels[1].id }], // Feature
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      boardId: board.id,
      laneId: inProgressLane.id,
      title: 'Implement JWT authentication',
      description: 'Set up JWT-based authentication with refresh tokens',
      priority: 'CRITICAL',
      position: 0,
      createdById: user1.id,
      estimatedHours: 8,
      assignees: {
        create: [{ userId: user1.id }],
      },
      labels: {
        create: [
          { labelId: labels[1].id }, // Feature
          { labelId: labels[4].id }, // Urgent
        ],
      },
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        taskId: task2.id,
        title: 'Set up JWT library',
        isCompleted: true,
        position: 0,
      },
      {
        taskId: task2.id,
        title: 'Create login endpoint',
        isCompleted: true,
        position: 1,
      },
      {
        taskId: task2.id,
        title: 'Create registration endpoint',
        isCompleted: false,
        position: 2,
      },
      {
        taskId: task2.id,
        title: 'Add refresh token logic',
        isCompleted: false,
        position: 3,
      },
    ],
  });

  const task3 = await prisma.task.create({
    data: {
      boardId: board.id,
      laneId: reviewLane.id,
      title: 'Fix login page responsive design',
      description: 'The login form breaks on mobile devices below 375px width',
      priority: 'MEDIUM',
      position: 0,
      createdById: user2.id,
      assignees: {
        create: [{ userId: user3.id }],
      },
      labels: {
        create: [{ labelId: labels[0].id }], // Bug
      },
    },
  });

  const task4 = await prisma.task.create({
    data: {
      boardId: board.id,
      laneId: doneLane.id,
      title: 'Set up project repository',
      description: 'Initialize Git repository and set up CI/CD pipeline',
      priority: 'HIGH',
      position: 0,
      createdById: user1.id,
      assignees: {
        create: [{ userId: user1.id }],
      },
      labels: {
        create: [{ labelId: labels[3].id }], // Documentation
      },
    },
  });

  const task5 = await prisma.task.create({
    data: {
      boardId: board.id,
      laneId: todoLane.id,
      title: 'Update API documentation',
      description: 'Document all new authentication endpoints',
      priority: 'LOW',
      position: 1,
      createdById: user2.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      assignees: {
        create: [{ userId: user2.id }],
      },
      labels: {
        create: [{ labelId: labels[3].id }], // Documentation
      },
    },
  });

  console.log('✓ Created sample tasks');

  // Create some comments
  await prisma.comment.create({
    data: {
      taskId: task2.id,
      userId: user2.id,
      content: 'Great progress! Make sure to add rate limiting to prevent brute force attacks.',
    },
  });

  await prisma.comment.create({
    data: {
      taskId: task3.id,
      userId: user2.id,
      content: 'I tested this on iPhone SE and it looks good now. Ready for review!',
    },
  });

  console.log('✓ Created comments');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDemo credentials:');
  console.log('Email: john@demo.com | Password: Demo123!');
  console.log('Email: jane@demo.com | Password: Demo123!');
  console.log('Email: bob@demo.com  | Password: Demo123!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
