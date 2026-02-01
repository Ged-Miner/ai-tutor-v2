-- DropIndex
DROP INDEX "chat_sessions_lessonId_studentId_key";

-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Chat 1';

-- CreateIndex
CREATE INDEX "chat_sessions_lessonId_studentId_idx" ON "chat_sessions"("lessonId", "studentId");
