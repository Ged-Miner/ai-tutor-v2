-- CreateTable
CREATE TABLE "pending_transcripts" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "lessonTitle" TEXT NOT NULL,
    "rawTranscript" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_transcripts_teacherId_idx" ON "pending_transcripts"("teacherId");

-- CreateIndex
CREATE INDEX "pending_transcripts_teacherCode_idx" ON "pending_transcripts"("teacherCode");

-- CreateIndex
CREATE INDEX "pending_transcripts_processed_idx" ON "pending_transcripts"("processed");

-- AddForeignKey
ALTER TABLE "pending_transcripts" ADD CONSTRAINT "pending_transcripts_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
