# AI Tutor 2.0

An educational web application that integrates with Chrome extension to automatically create AI-powered lesson chat rooms from live classroom transcripts.

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

DATABASE_URL=postgresql://postgres:devpassword123@localhost:5433/ai_tutor
