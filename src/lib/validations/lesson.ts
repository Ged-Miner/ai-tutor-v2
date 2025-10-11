import { z } from 'zod';

/**
 * Schema for creating a new lesson
 */
export const createLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Lesson title is required')
    .max(200, 'Lesson title must be less than 200 characters'),
  rawTranscript: z
    .string()
    .min(1, 'Transcript is required')
    .max(100000, 'Transcript is too large'), // ~100KB max
  summary: z
    .string()
    .max(50000, 'Summary is too large')
    .optional()
    .or(z.literal('')),
  customPrompt: z
    .string()
    .max(5000, 'Custom prompt is too large')
    .optional()
    .or(z.literal('')),
  position: z
    .number()
    .int()
    .min(0, 'Position must be a positive number')
    .optional(),
});

/**
 * Schema for updating an existing lesson
 * All fields are optional for partial updates
 */
export const updateLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Lesson title is required')
    .max(200, 'Lesson title must be less than 200 characters')
    .optional(),
  rawTranscript: z
    .string()
    .min(1, 'Transcript is required')
    .max(100000, 'Transcript is too large')
    .optional(),
  summary: z
    .string()
    .max(50000, 'Summary is too large')
    .optional()
    .or(z.literal('')),
  customPrompt: z
    .string()
    .max(5000, 'Custom prompt is too large')
    .optional()
    .or(z.literal('')),
  position: z
    .number()
    .int()
    .min(0, 'Position must be a positive number')
    .optional(),
});

// TypeScript types inferred from schemas
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
