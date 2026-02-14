# Nox Jira - Kanban Board

A production-grade Jira clone with Kanban board view, built with Next.js (frontend) and Node.js (backend).

## Features

- **Kanban Board** - To Do, In Progress, Done columns
- **Issue Management** - Create, edit, delete issues with unique IDs
- **Issue Details** - Title, description, assignee (email), owner (created by), comments with timestamps
- **Auth** - Sign up and sign in flow with session-based authentication
- **Premium Black/White Theme** - Professional, minimal design
- **MongoDB** - Persistent storage with Mongoose schemas
- **Logging & Error Handling** - Winston logger, centralized error handling

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB

## Hardcoded Users (seeded for testing)

| Email        | Password |
| ------------ | -------- |
| alice@nox.io | alice123 |
| bob@nox.io   | bob123   |
| carol@nox.io | carol123 |
| dave@nox.io  | dave123  |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Backend

```bash
cd backend
npm install
```

Set environment variables (optional):

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/nox-jira
PORT=4000
LOG_LEVEL=info
```

Seed hardcoded users:

```bash
npm run seed
```

Start the server:

```bash
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
│   │   ├── config/         # Constants, hardcoded users
│   │   ├── db/             # MongoDB connection
│   │   ├── lib/            # Logger, custom errors
│   │   ├── middleware/     # Auth, error handler
│   │   ├── models/         # User, Session, Issue, Comment schemas
│   │   ├── routes/         # Auth, issues, users
│   │   └── scripts/        # Seed script
│   └── package.json
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages
        ├── components/     # UI, auth, kanban, issues
        ├── contexts/       # Auth context
        ├── lib/            # API client, constants
        └── types/          # TypeScript types
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

### MCP Server
- `POST /mcp` - Model Context Protocol endpoint for AI/LLM tool integration

**MCP Tools:**
- `fetch_issues` - Fetch all issues (optional status filter)
- `get_issue` - Get a single issue by ID
- `modify_issue` - Update issue (title, description, assignee, status)
- `add_comment` - Add a comment to an issue
- `create_issue` - Create a new issue

Configure in Cursor (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "nox-jira": {
      "url": "http://localhost:4000/mcp"
    }
  }
}
```
