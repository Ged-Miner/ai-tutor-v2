import { z } from 'zod';

/**
 * Schema for validating transcript uploads from Chrome extension
 * This matches the JSON format
 */
export const uploadTranscriptSchema = z.object({
  courseCode: z
    .string()
    .min(1, 'Course code is required')
    .length(7, 'Course code must be exactly 7 characters')
    .regex(/^[A-Z0-9]{7}$/, 'Invalid course code format')
    .toUpperCase(),

  courseName: z
    .string()
    .min(1, 'Course name is required')
    .max(200, 'Course name must be less than 200 characters'),

  lessonTitle: z
    .string()
    .min(1, 'Lesson title is required')
    .max(200, 'Lesson title must be less than 200 characters'),

  transcript: z
    .string()
    .min(10, 'Transcript must be at least 10 characters')
    .max(100000, 'Transcript is too long (max 100,000 characters)'),

  capturedAt: z
    .string()
    .datetime()
    .transform((str) => new Date(str)), // Convert ISO string to Date object

  metadata: z
    .object({
      duration: z.number().optional(),
      source: z.string().optional(),
    })
    .optional(),
});

export type UploadTranscriptInput = z.infer<typeof uploadTranscriptSchema>;
