import { z } from 'zod';

/**
 * Schema for student enrollment via course code
 */
export const enrollmentSchema = z.object({
  courseCode: z
    .string()
    .min(1, 'Course code is required')
    .length(4, 'Course code must be exactly 4 digits')
    .regex(/^[0-9]{4}$/, 'Course code must be 4 digits'),
});

// TypeScript type inferred from schema
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
