/**
 * Shared types for transcript-related data
 */

export type TranscriptMetadata = {
  duration?: number;
  source?: string;
} | null;

export type Course = {
  id: string;
  name: string;
};

export type PendingTranscript = {
  id: string;
  courseName: string;
  lessonTitle: string;
  rawTranscript: string;
  capturedAt: string;
  metadata: TranscriptMetadata;
  createdAt: string;
  suggestedCourse: Course | null;
};
