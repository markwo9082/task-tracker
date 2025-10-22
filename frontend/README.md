# Task Tracker Frontend

Modern React-based frontend application for the Task Tracker Service.

## Tech Stack

- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Drag & Drop:** React Beautiful DnD

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env if needed
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Dashboard.tsx
│   ├── store/             # Redux store and slices
│   │   ├── index.ts       # Store configuration
│   │   └── authSlice.ts   # Auth state management
│   ├── services/          # API services
│   │   ├── api.ts         # Axios instance
│   │   └── auth.service.ts
│   ├── hooks/             # Custom React hooks
│   │   └── redux.ts       # Typed Redux hooks
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── .env.example           # Environment variables template
├── .eslintrc.cjs          # ESLint configuration
├── .gitignore
├── index.html             # HTML template
├── package.json
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Features Implemented

### ✅ Phase 1 - MVP
- [x] User authentication (Login/Register)
- [x] Protected routes
- [x] Redux state management
- [x] Material-UI design system
- [x] Responsive layout
- [x] Form validation
- [x] Error handling

### 🚧 In Progress
- [ ] Workspace management
- [ ] Board management
- [ ] Kanban board with drag & drop
- [ ] Task CRUD operations
- [ ] Real-time updates with WebSocket

### 📋 Planned
- [ ] User profile management
- [ ] Dark mode
- [ ] Multiple board views (List, Calendar)
- [ ] Search and filtering
- [ ] Notifications
- [ ] File attachments
- [ ] Comments and collaboration

## Environment Variables

See `.env.example` for all available environment variables.

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000/api)

## Demo Credentials

For testing purposes, you can use these demo credentials:

- **Email:** john@demo.com
- **Password:** Demo123!

## API Integration

The frontend communicates with the backend API through the following services:

- **Auth Service** (`services/auth.service.ts`) - User authentication and profile management
- **Axios Instance** (`services/api.ts`) - HTTP client with interceptors for token management

### Axios Interceptors

The Axios instance includes:
- **Request Interceptor:** Automatically adds JWT token to all requests
- **Response Interceptor:** Handles token refresh and authentication errors

## State Management

The application uses Redux Toolkit for state management:

- **Auth Slice** - Manages authentication state, user profile, and login/logout actions

### Custom Hooks

- `useAppDispatch` - Typed dispatch hook
- `useAppSelector` - Typed selector hook

## Routing

Protected routes automatically redirect unauthenticated users to the login page.

Routes:
- `/` - Redirects to `/login`
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard (protected)

## Styling

The application uses Material-UI for consistent, accessible, and responsive design:

- Theme configuration in `App.tsx`
- Custom components built with MUI
- Responsive breakpoints for mobile, tablet, and desktop

## License

MIT
