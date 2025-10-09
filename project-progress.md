# AI Tutor 2.0 - Project Progress

**Last Updated:** October 4, 2025
**Development Timeline:** Started September 29, 2025
**Target Completion:** December 15, 2025

---

## Executive Summary

We are rebuilding AI Tutor from scratch using modern technologies, with an emphasis on hands-on learning of Docker, PostgreSQL administration, and DevOps practices. The application will integrate with a Chrome extension to automatically capture classroom transcripts and create AI-powered lesson chat rooms for students.

**Current Status:** ✅ **Phase 1 & 2 Complete** - Foundation and Authentication Done
**Progress:** ~35% complete (3 of 7 weeks)

---

## ✅ Completed Work

### Phase 1, Week 1: Docker Environment Setup (COMPLETE)

**Objectives:** Set up development environment with Docker and PostgreSQL

**Accomplishments:**
- ✅ Next.js 15.5.4 project initialized with TypeScript, Tailwind CSS, ESLint
- ✅ Docker Compose configuration for local development
- ✅ PostgreSQL 17 running in Docker container (port 5433 to avoid conflicts)
- ✅ pgAdmin 4 for database GUI management (http://localhost:5050)
- ✅ Environment configuration (.env and .env.local files)
- ✅ Verified database connectivity from Next.js
- ✅ Test API endpoint (`/api/test`) confirming database connection

**Key Technical Decisions:**
- Using port 5433 for Docker PostgreSQL to avoid conflicts with system PostgreSQL
- JWT session strategy (not database sessions) for better performance
- Docker containers for development to match production environment

**Files Created:**
- `docker-compose.yml` - Multi-service Docker configuration
- `.env` and `.env.local` - Environment variables
- `src/lib/prisma.ts` - Prisma client singleton
- Database management scripts (see below)

---

### Phase 1, Week 2: Database Design & Prisma Setup (COMPLETE)

**Objectives:** Complete database schema, seed data, and backup workflow

**Accomplishments:**

**Database Schema:**
- ✅ 8 complete models with proper relationships and indexes:
  - `User` - Multi-role support (ADMIN, TEACHER, STUDENT) with OAuth + credentials
  - `Account` - OAuth provider accounts (NextAuth integration)
  - `Session` - User sessions (NextAuth integration)
  - `Course` - Teacher-created courses with settings
  - `Lesson` - Lessons with raw transcripts, AI summaries, and lesson codes
  - `Enrollment` - Student-course relationships
  - `ChatSession` - Student Q&A sessions with message history
  - `SystemPrompt` - Admin-editable AI prompts (tutor behavior, transcript processing)

**Seed Data:**
- ✅ Comprehensive seed script with realistic test data:
  - 1 Admin user (admin@aitutor.com)
  - 2 Teachers with unique teacher codes
  - 3 Students enrolled in various courses
  - 3 Courses with descriptions and settings
  - 3 Lessons with full transcripts and formatted summaries
  - 6 Enrollments across students and courses
  - 2 System prompts (tutor behavior and transcript summarization)
  - 1 Sample chat session with realistic conversation
- ✅ All users have bcrypt-hashed passwords

**Database Management:**
- ✅ Automated backup script (`scripts/backup-db.sh`)
  - Daily backups with compression
  - Auto-cleanup of backups older than 30 days
  - Timestamp-based file naming
- ✅ Database restore script (`scripts/restore-db.sh`)
  - Safety confirmation before restore
  - Handles compressed backups
- ✅ Quick reset script (`scripts/reset-db.sh`)
  - Drops, recreates, migrates, and seeds in one command
- ✅ Prisma Studio launcher (`scripts/db-studio.sh`)

**Development Tools:**
- ✅ Seed check endpoint (`/api/seed-check`) to view database contents
- ✅ Complete README.md with all commands and workflows
- ✅ Prisma migrations version controlled

**Files Created:**
- `prisma/schema.prisma` - Complete database schema
- `prisma/seed.ts` - Comprehensive seed data
- `scripts/backup-db.sh` - Automated backup
- `scripts/restore-db.sh` - Database restoration
- `scripts/reset-db.sh` - Quick database reset
- `scripts/db-studio.sh` - GUI launcher
- `README.md` - Complete project documentation

---

### Phase 2, Week 3: NextAuth.js Integration (COMPLETE)

**Objectives:** Implement authentication with role-based access control

**Accomplishments:**

**NextAuth.js v5 Configuration:**
- ✅ NextAuth.js v5 (beta.29) with Prisma adapter
- ✅ JWT session strategy for performance
- ✅ Custom TypeScript type definitions for extended User model
- ✅ Auth configuration in `src/auth.ts`
- ✅ API route handler at `/api/auth/[...nextauth]`

**Authentication Providers:**
- ✅ Credentials provider (email/password)
  - Bcrypt password hashing and verification
  - Secure credential validation
- ✅ Google OAuth provider (configured, needs client credentials to test)
  - Auto-detects AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET env vars

**Role-Based Access Control:**
- ✅ Three user roles: ADMIN, TEACHER, STUDENT
- ✅ Role information stored in JWT tokens
- ✅ Role-based dashboard layouts and navigation
- ✅ Session callbacks for custom user data (role, teacherCode)

**Authentication UI:**
- ✅ Custom sign-in page (`/auth/signin`)
  - Email/password form
  - Google OAuth button
  - Demo credentials display
  - Error handling
- ✅ Error page (`/auth/error`) with user-friendly messages
- ✅ Sign-up placeholder page (`/auth/signup`)

**Protected Routes:**
- ✅ Dashboard layout with authentication check
- ✅ Server-side session validation
- ✅ Automatic redirect to sign-in for unauthenticated users
- ✅ Role-specific navigation menus

**Dashboard Implementation:**
- ✅ Admin Dashboard:
  - System statistics (users, courses, lessons, chat sessions)
  - Links to user management and system prompts
- ✅ Teacher Dashboard:
  - List of teacher's courses
  - Course statistics (lesson count, student count)
  - Links to course and lesson management
- ✅ Student Dashboard:
  - Enrolled courses
  - Teacher information
  - Lesson availability
  - Links to chat interface

**Components:**
- ✅ SignOutButton component (client-side with CSRF protection)
- ✅ TypeScript types for dashboard data structures

**Files Created:**
- `src/auth.ts` - NextAuth configuration
- `src/types/next-auth.d.ts` - Extended NextAuth types
- `src/types/dashboard.ts` - Dashboard data types
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API handler
- `src/app/auth/signin/page.tsx` - Sign-in page
- `src/app/auth/signup/page.tsx` - Sign-up placeholder
- `src/app/auth/error/page.tsx` - Auth error page
- `src/app/dashboard/layout.tsx` - Protected dashboard layout
- `src/app/dashboard/page.tsx` - Role-based dashboard
- `src/components/sign-out-button.tsx` - Sign out component
- Updated `src/app/page.tsx` - Home page with auth-aware links

**Security Features:**
- ✅ CSRF protection on sign-out
- ✅ Secure password hashing with bcrypt (10 rounds)
- ✅ JWT token signing with AUTH_SECRET
- ✅ Protected API routes and pages

---

## 🚧 In Progress / Next Steps

### Phase 2, Week 4: User Management & Core Features (NEXT)

**Objectives:** Build CRUD interfaces for managing users, courses, and lessons

**Planned Tasks:**
- [ ] Admin user management interface
  - Create, read, update, delete users
  - Role assignment
  - Teacher code generation
- [ ] Teacher course management
  - Create/edit courses
  - Course settings and descriptions
  - Student enrollment management
- [ ] Teacher lesson management
  - Manual lesson creation (before Chrome extension)
  - Lesson ordering and organization
  - Edit lesson summaries
- [ ] Student enrollment flow
  - Join course via teacher code
  - View course details before enrolling
- [ ] Form validation with Zod
- [ ] Loading states and error handling
- [ ] Optimistic UI updates

**Estimated Time:** 1 week

---

### Phase 3, Week 5: Real-time Chat with Socket.io (UPCOMING)

**Objectives:** Implement real-time WebSocket communication for AI tutoring

**Planned Tasks:**
- [ ] Custom Next.js server for Socket.io integration
- [ ] WebSocket connection management
- [ ] Room-based messaging for lessons
- [ ] Chat interface UI (left panel: summary, right panel: chat)
- [ ] Message persistence to database
- [ ] Typing indicators
- [ ] Online presence
- [ ] Message history with pagination
- [ ] Reconnection handling
- [ ] Socket.io client hooks

**Technical Requirements:**
- Custom `server.js` file
- Socket.io server and client
- Update package.json scripts
- React hooks for Socket.io state management

**Estimated Time:** 1 week

---

### Phase 4, Week 6: AI Integration & Transcript Processing (UPCOMING)

**Objectives:** Integrate OpenAI API for AI tutoring and transcript summarization

**Planned Tasks:**
- [ ] OpenAI API integration
- [ ] System prompt management (admin-editable)
- [ ] Transcript processing pipeline:
  - Accept raw transcript from Chrome extension
  - Generate formatted markdown summary
  - Extract key concepts and topics
- [ ] Chat message generation:
  - Context-aware responses using lesson content
  - Restrict AI to lesson topics
  - Encourage step-by-step thinking
- [ ] Streaming responses for better UX
- [ ] Rate limiting and error handling
- [ ] Token usage tracking
- [ ] Prompt versioning system

**API Endpoints Needed:**
- `POST /api/transcript/upload` - Receive transcript from Chrome extension
- `POST /api/transcript/process` - Generate summary from raw transcript
- `POST /api/chat/message` - Send message to AI, get response

**Estimated Time:** 1 week

---

### Phase 5: Chrome Extension Integration (UPCOMING)

**Objectives:** Connect Chrome extension and implement automatic lesson creation

**Planned Tasks:**
- [ ] API endpoints for Chrome extension
  - Authentication (JWT tokens)
  - Transcript upload
  - Lesson creation
- [ ] CORS configuration for extension requests
- [ ] Rate limiting
- [ ] Request validation with Zod
- [ ] Handle multiple transcript uploads for same lesson
- [ ] Automatic chat room creation:
  - Process transcript → generate summary
  - Create lesson record
  - Make available to enrolled students
- [ ] Mock Chrome extension for testing (until real one available)
- [ ] Error handling and retry logic

**Data Flow:**
1. Extension captures live transcript in Google Docs
2. Teacher ends lesson → extension uploads transcript
3. Backend processes transcript → generates summary
4. Auto-creates lesson chat room with summary
5. Students can access for Q&A

**Estimated Time:** 1 week

---

### Phase 6: Advanced Features (UPCOMING)

**Objectives:** Implement remaining product features

**Planned Tasks:**
- [ ] Text selection → AI query feature:
  - Special text selection in summary panel
  - Query AI about selected text
  - Max selection size limits
  - Integration with chat window
- [ ] Pre-lesson preparation wizard:
  - Teacher chat interface for lesson setup
  - Multiple file upload capability
  - AI-assisted lesson prompt generation
  - Material upload integration
- [ ] Teacher prompt customization:
  - Per-teacher core prompt editing
  - Per-lesson prompt overrides
  - Admin control over customization permissions
- [ ] Lesson reordering (drag-and-drop)
- [ ] Improved UI/UX:
  - Markdown rendering in chat
  - Weblink support in chat
  - Better chat length handling
  - Simplified lesson creation workflow
- [ ] Tab system for Summary vs Raw Transcript views
- [ ] Link to original Google Doc in transcript

**Estimated Time:** 1-2 weeks

---

### Phase 7, Week 7: Deployment & DevOps (FINAL)

**Objectives:** Deploy to production VPS with proper DevOps setup

**Planned Tasks:**

**VPS Setup (Hetzner):**
- [ ] Provision VPS (~$4-5/month)
- [ ] Initial server hardening
  - SSH key setup
  - Disable password authentication
  - Configure firewall (UFW)
  - Fail2ban setup
- [ ] Install Docker and Docker Compose
- [ ] Set up user accounts and permissions

**Application Deployment:**
- [ ] Configure production docker-compose.yml
- [ ] Set up environment variables securely
- [ ] Deploy PostgreSQL container
- [ ] Deploy Next.js application container
- [ ] Configure container networking

**Web Server & SSL:**
- [ ] Install and configure Nginx reverse proxy
- [ ] Domain name configuration (DNS)
- [ ] SSL certificates with Let's Encrypt
- [ ] HTTPS redirect setup
- [ ] WebSocket proxy configuration for Socket.io

**Monitoring & Backups:**
- [ ] Automated database backups with cron
- [ ] Backup upload to cloud storage (optional)
- [ ] Log rotation setup
- [ ] Uptime monitoring (Uptime Kuma or similar)
- [ ] Resource monitoring (disk, memory, CPU)
- [ ] Error tracking integration (Sentry free tier)

**CI/CD (Optional):**
- [ ] GitHub Actions for automated deployment
- [ ] Automated testing pipeline
- [ ] Docker image building and pushing

**Documentation:**
- [ ] Production deployment guide
- [ ] Backup and restore procedures
- [ ] Monitoring and maintenance guide
- [ ] Troubleshooting guide

**Estimated Time:** 1 week (more if new to DevOps)

---

## 📊 Overall Progress Summary

### Completed (Weeks 1-3)
- ✅ Development environment with Docker
- ✅ PostgreSQL database with complete schema
- ✅ Prisma ORM with migrations and seed data
- ✅ Database backup/restore workflow
- ✅ NextAuth.js v5 authentication
- ✅ Role-based access control
- ✅ Protected dashboard with role-specific views
- ✅ Authentication UI (sign-in, error pages)

### In Progress / Next (Weeks 4-7)
- 🚧 User and course management interfaces (Week 4)
- ⏳ Real-time chat with Socket.io (Week 5)
- ⏳ AI integration with OpenAI (Week 6)
- ⏳ Chrome extension API endpoints (Week 6)
- ⏳ Advanced features (text selection, wizard) (Week 6)
- ⏳ VPS deployment with Docker (Week 7)

### Timeline
- **Weeks 1-3:** ✅ Complete (Sept 29 - Oct 4, 2025)
- **Weeks 4-7:** 🚧 In Progress (Oct 5 - Nov 1, 2025)
- **Buffer Time:** Nov 2 - Dec 15, 2025
- **Target Launch:** December 15, 2025

---

## 🎯 Success Criteria

### Technical Goals
- ✅ Docker containers running smoothly in development
- ✅ PostgreSQL with proper indexing and relationships
- ✅ Automated backup system
- ✅ Working authentication with multiple providers
- ⏳ Real-time WebSocket communication
- ⏳ AI-powered chat responses
- ⏳ Chrome extension integration
- ⏳ Production deployment on VPS
- ⏳ <200ms API response time
- ⏳ 99% uptime
- ⏳ Automated daily backups

### Learning Goals
- ✅ Docker fundamentals and container orchestration
- ✅ PostgreSQL administration
- ✅ Database design patterns
- ✅ NextAuth.js authentication patterns
- ✅ Role-based security
- ⏳ WebSocket protocols and real-time communication
- ⏳ AI API integration
- ⏳ Linux server administration
- ⏳ DevOps practices (CI/CD, monitoring, backups)
- ⏳ Production infrastructure management

### Business Goals
- ⏳ Support 100-200 concurrent users
- ⏳ Automatic lesson creation from transcripts
- ⏳ AI tutor responds to student questions
- ⏳ Teachers can customize AI behavior
- ⏳ Students can access lesson content post-class
- ⏳ Stay within ¥10,000/month (~$65-70 USD) budget

---

## 📝 Notes & Decisions

### Technology Choices
- **Next.js 15.5.4:** Latest stable version, excellent TypeScript support
- **PostgreSQL 17:** Powerful relational database, self-hosted for learning
- **Prisma:** Type-safe ORM with excellent DX
- **NextAuth.js v5:** Modern auth solution, multiple provider support
- **Socket.io:** Industry standard for WebSockets
- **Hetzner VPS:** Best price/performance ratio for deployment

### Port Assignments
- `3000` - Next.js development server
- `5432` - PostgreSQL (internal to Docker)
- `5433` - PostgreSQL (external access, avoiding system conflicts)
- `5050` - pgAdmin web interface
- `5555` - Prisma Studio (when running)
- `3001` - Socket.io server (planned)

### Demo Accounts
All demo accounts use password format: `{role}123`

**Admin:**
- Email: admin@aitutor.com
- Password: admin123

**Teachers:**
- Email: john.smith@university.edu (Code: TEACH001)
- Password: teacher123
- Email: sarah.jones@university.edu (Code: TEACH002)
- Password: teacher123

**Students:**
- Email: alice@student.edu
- Password: student123
- Email: bob@student.edu
- Password: student123
- Email: charlie@student.edu
- Password: student123

---

## 🔗 Quick Reference Links

### Local Development
- Main App: http://localhost:3000
- Sign In: http://localhost:3000/auth/signin
- Dashboard: http://localhost:3000/dashboard
- pgAdmin: http://localhost:5050
- Prisma Studio: http://localhost:5555 (when running `npm run prisma studio`)

### API Endpoints
- Test: http://localhost:3000/api/test
- Seed Check: http://localhost:3000/api/seed-check
- Auth: http://localhost:3000/api/auth/*

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Docker Docs](https://docs.docker.com/)

---

## 🐛 Known Issues & Technical Debt

### Current Issues
- None currently! 🎉

### Future Considerations
- Add password reset functionality
- Add email verification for new accounts
- Implement account linking (connect OAuth to existing credential account)
- Add two-factor authentication
- Implement soft deletes for important records
- Add audit logging for admin actions
- Consider Redis for session caching at scale
- Implement read replicas for database scaling

---

## 📚 Files Changed Per Week

### Week 1 Files
```
docker-compose.yml
.env
.env.local
src/lib/prisma.ts
src/app/api/test/route.ts
.gitignore
```

### Week 2 Files
```
prisma/schema.prisma
prisma/seed.ts
prisma/migrations/*
scripts/backup-db.sh
scripts/restore-db.sh
scripts/reset-db.sh
scripts/db-studio.sh
src/app/api/seed-check/route.ts
README.md
```

### Week 3 Files
```
src/auth.ts
src/types/next-auth.d.ts
src/types/dashboard.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/auth/signin/page.tsx
src/app/auth/signup/page.tsx
src/app/auth/error/page.tsx
src/app/dashboard/layout.tsx
src/app/dashboard/page.tsx
src/components/sign-out-button.tsx
src/app/page.tsx (updated)
prisma/schema.prisma (added password field)
prisma/seed.ts (updated with passwords)
```

---

**Last Updated:** October 4, 2025
**Next Review:** After Week 4 completion
