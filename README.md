# AI Tutor 2.0

An educational web application that receives incoming class transcripts, generates lesson summaries, and facilitates AI-powered chat partners for students to receive guidance specifically about their courses.

## Tech Stack

- **Frontend/Backend**: Next.js 15.5.4 with TypeScript
- **Database**: PostgreSQL 17 (Docker)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Real-time**: Socket.io
- **AI**: OpenAI API
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-tutor-v2
npm install
```

### 2. Environment Setup

Create `.env.local` file with the following:

```bash
# Database Configuration
DB_USER=postgres
DB_PASSWORD=devpassword123
DB_NAME=ai_tutor
DATABASE_URL=postgresql://postgres:devpassword123@localhost:5433/ai_tutor

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# pgAdmin Configuration
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin123

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Socket.io Configuration
SOCKET_PORT=3001
```

Also create `.env` file for Prisma:

```bash
DATABASE_URL=postgresql://postgres:devpassword123@localhost:5433/ai_tutor
```

### 3. Start Docker Services

```bash
docker compose up -d
```

### 4. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Database Management

### Backup Database

```bash
./scripts/backup-db.sh
```

Backups are stored in the `backup/` directory with timestamps. Files older than 30 days are automatically cleaned up.

### Restore Database

```bash
./scripts/restore-db.sh backup/backup_YYYYMMDD_HHMMSS.sql.gz
```

### Reset Database

Drops database, recreates it, runs migrations, and seeds data:

```bash
./scripts/reset-db.sh
```

### Open Prisma Studio (Database GUI)

```bash
./scripts/db-studio.sh
# Or directly:
npx prisma studio
```

Opens at http://localhost:5555

## Available Services

- **Main App**: http://localhost:3000
- **pgAdmin**: http://localhost:5050 (admin@example.com / admin123)
- **Prisma Studio**: http://localhost:5555 (when running)

## API Endpoints (Development)

- `GET /api/test` - Database connection test
- `GET /api/seed-check` - View seeded data

## Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (complete cleanup)
docker compose down -v

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f postgres

# View running containers
docker ps

# Execute command in container
docker exec -it ai_tutor_db psql -U postgres -d ai_tutor
```

## Seed Data (Development)

Default users created by seed script:

- **Admin**: admin@aitutor.com
- **Teacher 1**: john.smith@university.edu (Code: TEACH001)
- **Teacher 2**: sarah.jones@university.edu (Code: TEACH002)
- **Students**:
  - alice@student.edu
  - bob@student.edu
  - charlie@student.edu

Passwords (for future implementation): Check `prisma/seed.ts`

## Project Structure

```
ai-tutor-v2/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/             # API routes
│   │   │   ├── test/        # Database test endpoint
│   │   │   └── seed-check/  # View seed data
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   └── lib/                 # Shared utilities
│       └── prisma.ts        # Prisma client instance
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed script with sample data
├── scripts/                 # Database management scripts
│   ├── backup-db.sh         # Backup database
│   ├── restore-db.sh        # Restore from backup
│   ├── reset-db.sh          # Full database reset
│   └── db-studio.sh         # Launch Prisma Studio
├── backup/                  # Database backups (gitignored)
├── public/                  # Static files
├── docker-compose.yml       # Docker services configuration
├── .env                     # Environment for Prisma (gitignored)
├── .env.local               # Environment for Next.js (gitignored)
└── package.json             # Dependencies and scripts
```

## Database Schema

### Users
- Supports three roles: ADMIN, TEACHER, STUDENT
- Teachers have unique teacher codes
- Integrates with NextAuth for authentication

### Courses
- Created by teachers
- Contains multiple lessons
- Students enroll via teacher codes

### Lessons
- Contains raw transcripts
- AI-generated summaries
- Unique lesson codes
- Ordered by position

### Chat Sessions
- Student Q&A sessions linked to specific lessons
- Messages stored as JSON
- AI tutor responses based on lesson content

### System Prompts
- Configurable AI behavior
- Separate prompts for tutoring and transcript summarization
- Admin-editable

## Development Workflow

### 1. Making Schema Changes

```bash
# Edit prisma/schema.prisma
# Then create migration:
npx prisma migrate dev --name description_of_changes

# This will:
# - Create migration file
# - Apply to database
# - Regenerate Prisma Client
```

### 2. Updating Seed Data

```bash
# Edit prisma/seed.ts
# Then run:
npx prisma db seed
```

### 3. Viewing Data

```bash
# Option 1: Prisma Studio (recommended)
npx prisma studio

# Option 2: pgAdmin
# Visit http://localhost:5050

# Option 3: PostgreSQL CLI
docker exec -it ai_tutor_db psql -U postgres -d ai_tutor
```

### 4. Testing Changes

```bash
# Start dev server
npm run dev

# Check test endpoints
curl http://localhost:3000/api/test
curl http://localhost:3000/api/seed-check
```

## Troubleshooting

### Docker permission denied

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Port already in use (5432)

PostgreSQL might be running on your system. The docker-compose.yml is configured to use port 5433 externally to avoid conflicts.

### Prisma Client not initialized

```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

### Database connection failed

```bash
# Check if containers are running
docker ps

# Check container logs
docker compose logs postgres

# Restart containers
docker compose restart
```

## Next Steps

- [ ] Phase 2: Authentication with NextAuth.js
- [ ] Phase 3: Real-time chat with Socket.io
- [ ] Phase 4: AI integration and transcript processing
- [ ] Phase 5: transcript import integration
- [ ] Phase 6: Deployment to VPS

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

```
ai-tutor-v2
├─ .next
├─ README.md
├─ backup
├─ components.json
├─ docker
├─ docker-compose.yml
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250928104948_init
│  │  │  └─ migration.sql
│  │  ├─ 20251002101502_add_user_password
│  │  │  └─ migration.sql
│  │  ├─ 20251009121024_add_cascade_deletes
│  │  │  └─ migration.sql
│  │  ├─ 20251012100508_add_message_model
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ project-progress.md
├─ public
│  └─ next.svg
├─ scripts
│  ├─ backup-db.sh
│  ├─ db-studio.sh
│  ├─ reset-db.sh
│  └─ restore-db.sh
├─ server.mjs
├─ src
│  ├─ app
│  │  ├─ (authenticated)
│  │  │  ├─ admin
│  │  │  │  └─ users
│  │  │  │     └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ student
│  │  │  │  ├─ courses
│  │  │  │  │  ├─ [courseId]
│  │  │  │  │  │  └─ lessons
│  │  │  │  │  │     ├─ [lessonId]
│  │  │  │  │  │     │  └─ page.tsx
│  │  │  │  │  │     └─ page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ enroll
│  │  │  │     └─ page.tsx
│  │  │  ├─ teacher
│  │  │  │  └─ courses
│  │  │  │     ├─ [courseId]
│  │  │  │     │  └─ lessons
│  │  │  │     │     └─ page.tsx
│  │  │  │     └─ page.tsx
│  │  │  └─ test-socket
│  │  │     └─ page.tsx
│  │  ├─ (public)
│  │  │  ├─ auth
│  │  │  │  ├─ error
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ signin
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ signup
│  │  │  │     └─ page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ api
│  │  │  ├─ admin
│  │  │  │  ├─ generate-teacher-code
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ users
│  │  │  │     ├─ [id]
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ route.ts
│  │  │  ├─ auth
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  ├─ chat
│  │  │  │  ├─ generate-response
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ messages
│  │  │  │     └─ route.ts
│  │  │  ├─ seed-check
│  │  │  │  └─ route.ts
│  │  │  ├─ student
│  │  │  │  ├─ courses
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ enroll
│  │  │  │     └─ route.ts
│  │  │  ├─ teacher
│  │  │  │  └─ courses
│  │  │  │     ├─ [courseId]
│  │  │  │     │  ├─ lessons
│  │  │  │     │  │  ├─ [id]
│  │  │  │     │  │  │  └─ route.ts
│  │  │  │     │  │  └─ route.ts
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ route.ts
│  │  │  └─ test
│  │  │     └─ route.ts
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ auth.ts
│  ├─ components
│  │  ├─ admin
│  │  │  ├─ create-user-button.tsx
│  │  │  ├─ delete-user-modal.tsx
│  │  │  ├─ edit-user-modal.tsx
│  │  │  ├─ user-form-modal.tsx
│  │  │  └─ users-table.tsx
│  │  ├─ sign-out-button.tsx
│  │  ├─ student
│  │  │  ├─ chat-interface.tsx
│  │  │  ├─ enrollment-form.tsx
│  │  │  ├─ lesson-summary.tsx
│  │  │  ├─ lesson-tabs.tsx
│  │  │  └─ student-course-card.tsx
│  │  ├─ teacher
│  │  │  ├─ course-form-modal.tsx
│  │  │  ├─ courses-table.tsx
│  │  │  ├─ create-course-button.tsx
│  │  │  ├─ create-lesson-button.tsx
│  │  │  ├─ delete-course-modal.tsx
│  │  │  ├─ delete-lesson-modal.tsx
│  │  │  ├─ edit-course-modal.tsx
│  │  │  ├─ edit-lesson-modal.tsx
│  │  │  ├─ lesson-form-modal.tsx
│  │  │  └─ lessons-table.tsx
│  │  └─ ui
│  │     ├─ alert.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ dialog.tsx
│  │     ├─ form.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     └─ textarea.tsx
│  ├─ hooks
│  │  ├─ useChatSocket.ts
│  │  └─ useSocket.ts
│  ├─ lib
│  │  ├─ openai.ts
│  │  ├─ prisma.ts
│  │  ├─ utils
│  │  │  ├─ generate-lesson-code.ts
│  │  │  └─ generate-teacher-code.ts
│  │  ├─ utils.ts
│  │  └─ validations
│  │     ├─ course.ts
│  │     ├─ enrollment.ts
│  │     ├─ lesson.ts
│  │     └─ user.ts
│  └─ types
│     ├─ api.ts
│     ├─ dashboard.ts
│     └─ next-auth.d.ts
└─ tsconfig.json

```

# Notes about dependency pinning issues:
{
  "dependencies": {
    "next-auth": "5.0.0-beta.29", // Pinned: Version conflict with @auth/prisma-adapter
    "@auth/prisma-adapter": "2.4.2", // Pinned: Compatible with next-auth beta.29
    "@auth/core": "0.40.0" // Pinned: Explicit override to resolve type conflicts
  }
}
