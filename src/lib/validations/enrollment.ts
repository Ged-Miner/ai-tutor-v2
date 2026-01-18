import { z } from 'zod';

/**
 * Schema for student enrollment via course code
 */
export const enrollmentSchema = z.object({
  courseCode: z
    .string()
    .min(1, 'Course code is required')
    .length(7, 'Course code must be exactly 7 characters')
    .regex(/^[A-Z0-9]{7}$/, 'Invalid course code format. Must be 7 uppercase letters/numbers')
    .toUpperCase(),
});

// TypeScript type inferred from schema
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
