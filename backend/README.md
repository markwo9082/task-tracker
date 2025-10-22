# Task Tracker Backend API

Backend API for the Task Tracker Service built with Node.js, Express, TypeScript, and Prisma.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Zod
- **Logging:** Winston

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ running
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

3. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run migrate

# (Optional) Seed the database
npm run db:seed
```

### Development

Run the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

### Building for Production

```bash
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Database Management

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Create a new migration
npm run migrate

# Reset database (WARNING: This will delete all data)
npm run migrate:reset

# Seed the database
npm run db:seed
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### Health Check

```http
GET /api/health
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Database seed file
├── src/
│   ├── config/            # Configuration files
│   │   ├── database.ts    # Prisma client setup
│   │   ├── env.ts         # Environment variables
│   │   └── logger.ts      # Winston logger setup
│   ├── controllers/       # Request handlers
│   │   └── auth.controller.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # Authentication middleware
│   │   ├── errorHandler.ts
│   │   └── validate.ts    # Zod validation middleware
│   ├── routes/            # API routes
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── services/          # Business logic
│   │   └── auth.service.ts
│   ├── types/             # TypeScript types and Zod schemas
│   │   └── auth.schemas.ts
│   ├── utils/             # Utility functions
│   │   ├── errors.ts      # Custom error classes
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── password.ts    # Password hashing
│   │   └── response.ts    # API response helpers
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── .env.example           # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── .gitignore
├── jest.config.js         # Jest configuration
├── package.json
├── README.md
└── tsconfig.json          # TypeScript configuration
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

## License

MIT
