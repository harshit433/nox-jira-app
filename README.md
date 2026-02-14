# Nox Jira - Kanban Board

A production-grade Jira clone with Kanban board view, built with Next.js (frontend) and Node.js (backend).

## Features

- **Kanban Board** - To Do, In Progress, Done columns
- **Issue Management** - Create, edit, delete issues with unique IDs
- **Issue Details** - Title, description, assignee (email), owner (created by), comments with timestamps
- **Auth** - Sign up and sign in flow with session-based authentication
- **Premium Black/White Theme** - Professional, minimal design

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Storage**: JSON file storage (local)

## Hardcoded Users (for testing)

| Email        | Password |
| ------------ | -------- |
| alice@nox.io | alice123 |
| bob@nox.io   | bob123   |
| carol@nox.io | carol123 |
| dave@nox.io  | dave123  |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### Environment (optional)

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Project Structure

```
nox-jira-app/
├── backend/
│   ├── src/
│   │   ├── config/       # Constants, hardcoded users
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # Auth, issues, users
│   │   ├── storage/      # JSON file storage
│   │   └── index.js
│   └── data/             # Generated at runtime (users, issues, sessions)
└── frontend/
    └── src/
        ├── app/          # Next.js App Router pages
        ├── components/    # UI, auth, kanban, issues
        ├── contexts/     # Auth context
        ├── lib/          # API client, constants
        └── types/        # TypeScript types
```

## API Endpoints

### Auth
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Current user (requires token)

### Issues
- `GET /api/issues` - List all issues
- `GET /api/issues/:id` - Get issue
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/comments` - Add comment
- `DELETE /api/issues/:id/comments/:commentId` - Delete comment

### Users
- `GET /api/users` - List users (for assignee dropdown)
