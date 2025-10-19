# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Tutor 2.0 is an educational web application that integrates with a Chrome extension to automatically create AI-powered lesson chat rooms from live classroom transcripts. Students can enroll in courses using teacher codes, view lesson summaries, and interact with an AI tutor in real-time via Socket.io-powered chat.

## Tech Stack

- **Framework**: Next.js 15.5.4 with TypeScript (App Router)
- **Database**: PostgreSQL 17 (Docker) with Prisma ORM
- **Authentication**: NextAuth.js v5 with both Credentials and Google providers
- **Real-time**: Socket.io (custom server.mjs)
- **AI**: OpenAI API (GPT-4o-mini)
- **Styling**: Tailwind CSS with Radix UI components

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Start Docker services (PostgreSQL + pgAdmin)
docker compose up -d

# Run database migrations
npx prisma migrate dev

# Seed database with test data
npx prisma db seed

# Generate Prisma client (after schema changes)
npx prisma generate
```

### Running the App
```bash
# Start development server (runs Next.js + Socket.io on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Database Management
```bash
# Open Prisma Studio (GUI for viewing/editing database)
npm run db:studio
# Or: ./scripts/db-studio.sh

# Reset database (drops, recreates, migrates, seeds)
npm run db:reset
# Or: ./scripts/reset-db.sh

# Backup database
./scripts/backup-db.sh

# Restore from backup
./scripts/restore-db.sh backup/backup_YYYYMMDD_HHMMSS.sql.gz

# Create new migration
npx prisma migrate dev --name description_of_changes
```

### Prisma Workflow
When making schema changes:
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change_description`
3. This automatically generates Prisma Client and applies migrations
4. Update seed file if needed: `prisma/seed.ts`

## Architecture

### Custom Server (server.mjs)

This app uses a **custom Node.js server** instead of the default Next.js server to integrate Socket.io for real-time chat. The server:
- Runs Next.js app via the `next` package
- Creates HTTP server and attaches Socket.io
- Handles WebSocket connections for real-time chat
- Listens on port 3000 (configurable via `PORT` env var)

**Important**: Always use `npm run dev` or `node server.mjs`, NOT `next dev`, as the custom server is required for Socket.io functionality.

### Socket.io Real-time Flow

1. Client connects via `useSocket()` hook ([src/hooks/useSocket.ts](src/hooks/useSocket.ts))
2. Client joins lesson room via `useChatSocket()` hook ([src/hooks/useChatSocket.ts](src/hooks/useChatSocket.ts))
3. User sends message → Socket emits `send_message` event → Server saves to DB
4. Server broadcasts message to all clients in lesson room via `receive_message` event
5. For USER messages, server automatically:
   - Fetches lesson context (transcript + summary)
   - Calls `/api/chat/generate-response` endpoint
   - Uses OpenAI API to generate AI tutor response
   - Saves AI response to DB
   - Broadcasts AI response to all clients in room

**Key Socket Events**:
- `join_lesson` / `leave_lesson` - Room management
- `send_message` - Send message (with lessonId, studentId, content, role)
- `receive_message` - Receive message broadcast
- `message_error` - Error handling

### Authentication Flow

NextAuth.js v5 with dual authentication:
- **Credentials**: Email/password (bcrypt hashed)
- **Google OAuth**: Optional provider

**Session Management**:
- Strategy: JWT (not database sessions)
- Custom callbacks extend JWT/session with `role`, `teacherId`, `teacherCode`
- Session available server-side via `await auth()` from [src/auth.ts](src/auth.ts)
- Protected routes use `(authenticated)` route group with layout checking session

**Role-based Access**:
- `ADMIN`: Can manage all users and courses
- `TEACHER`: Can create courses/lessons, has unique teacher code
- `STUDENT`: Can enroll in courses using teacher codes, chat with AI tutor

### Database Schema Overview

**Key Models**:
- `User`: Multi-role (ADMIN/TEACHER/STUDENT), teachers have unique `teacherCode`
- `Course`: Owned by teacher, contains lessons, students enroll via teacher code
- `Lesson`: Contains `rawTranscript`, AI-generated `summary`, unique `lessonCode`, ordered by `position`
- `ChatSession`: One per student per lesson, contains messages
- `Message`: Individual chat messages with `role` (USER/ASSISTANT)
- `SystemPrompt`: Configurable AI prompts (e.g., `default_tutor_prompt`)
- `Enrollment`: Join table linking students to courses

**Important Relationships**:
- All relations use `onDelete: Cascade` for data integrity
- ChatSession unique constraint: `[lessonId, studentId]`
- Enrollment unique constraint: `[studentId, courseId]`

### API Route Patterns

All API routes in `src/app/api/`:
- Use `await auth()` for authentication
- Return `NextResponse.json()` with proper status codes
- Validate input with Zod schemas from `src/lib/validations/`
- Include role-based authorization checks
- Follow RESTful conventions (GET, POST, PUT, DELETE)

**Route Organization**:
- `/api/admin/*` - Admin-only endpoints (user/course management)
- `/api/teacher/*` - Teacher endpoints (course/lesson CRUD)
- `/api/student/*` - Student endpoints (enrollment, course list)
- `/api/chat/*` - Chat-related endpoints (AI response generation, message retrieval)
- `/api/auth/[...nextauth]` - NextAuth.js handlers

### AI Integration

OpenAI integration in [src/lib/openai.ts](src/lib/openai.ts):
- Uses GPT-4o-mini model for cost efficiency
- System prompts stored in database (`SystemPrompt` model)
- Context provided to AI includes:
  - Lesson title, summary, and full transcript
  - Conversation history (last 20 messages)
  - Current user message
- Temperature: 0.7, Max tokens: 500

**Flow**: User message → Socket.io → Server → API route → OpenAI → DB save → Socket broadcast

### Route Groups

- `(authenticated)` - Protected routes requiring session, includes role-based navigation
- `(public)` - Public routes (auth pages, landing page)

### Component Organization

Components are organized by role and function:
- `src/components/ui/` - Reusable Radix UI components (button, card, dialog, etc.)
- `src/components/admin/` - Admin-specific components (user management)
- `src/components/teacher/` - Teacher components (course/lesson forms, tables)
- `src/components/student/` - Student components (enrollment form, course cards, chat interface, lesson summary)

**Key Student Components**:
- `chat-interface.tsx` - Real-time chat UI using Socket.io
- `lesson-summary.tsx` - Displays AI-generated lesson summary with markdown
- `lesson-tabs.tsx` - Tabs for switching between summary and chat
- `student-course-card.tsx` - Course card linking to lessons

### Environment Variables

Required in `.env.local`:
```bash
DATABASE_URL=postgresql://postgres:devpassword123@localhost:5433/ai_tutor
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-api-key
```

Optional:
```bash
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
PORT=3000  # Custom server port
```

Also create `.env` for Prisma CLI (same DATABASE_URL).

## Key Implementation Details

### Prisma Client Singleton

The app uses a singleton pattern for Prisma Client ([src/lib/prisma.ts](src/lib/prisma.ts)) to prevent too many connections in development due to hot reload.

### Code Generation Utilities

- `generate-teacher-code.ts` - Generates unique teacher codes (e.g., TEACH001)
- `generate-lesson-code.ts` - Generates unique lesson codes for student access

### Type Safety

- Prisma generates types automatically from schema
- Custom types in `src/types/`:
  - `next-auth.d.ts` - Extends NextAuth types with custom user properties
  - `api.ts` - API response types
  - `dashboard.ts` - Dashboard data types

### Validation Schemas

Zod schemas in `src/lib/validations/`:
- `user.ts` - User creation/update validation
- `course.ts` - Course creation/update validation
- `lesson.ts` - Lesson creation/update validation
- `enrollment.ts` - Enrollment validation

## Development Workflow

### Adding a New Feature

1. **Database changes**: Update `prisma/schema.prisma` → run migration
2. **API routes**: Create route handlers with auth/validation
3. **Types**: Update types if needed (usually auto-generated by Prisma)
4. **Components**: Build UI components in appropriate role folder
5. **Integration**: Wire up with Socket.io if real-time needed

### Testing Endpoints

```bash
# Start dev server
npm run dev

# Test database connection
curl http://localhost:3000/api/test

# View seeded data
curl http://localhost:3000/api/seed-check

# Test Socket.io connection
# Visit http://localhost:3000/test-socket (if test page exists)
```

### Seed Data

Default users created by `prisma/seed.ts`:
- Admin: admin@aitutor.com
- Teachers: john.smith@university.edu (TEACH001), sarah.jones@university.edu (TEACH002)
- Students: alice@student.edu, bob@student.edu, charlie@student.edu

Check seed file for passwords (development only).

## Common Pitfalls

### Don't use `next dev`
Always use `npm run dev` which runs the custom `server.mjs`. Using `next dev` will break Socket.io functionality.

### Regenerate Prisma Client
After schema changes, Prisma Client is auto-generated during migration. If types are missing, run `npx prisma generate`.

### Docker Port Conflict
The app uses port 5433 externally for PostgreSQL to avoid conflicts with local PostgreSQL on 5432.

### Clear Next.js Cache
If seeing stale data or type errors after schema changes:
```bash
rm -rf .next
npm run dev
```

## Chrome Extension Integration (Planned)

The app is designed to receive live classroom transcripts from a Chrome extension. The extension will:
- Capture live audio/transcripts from classroom sessions
- Send transcripts to teacher's lesson via authenticated API
- Auto-generate lesson summaries using OpenAI

This integration is part of the planned roadmap.
