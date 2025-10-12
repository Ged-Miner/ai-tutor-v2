import { z } from 'zod';

/**
 * Schema for student enrollment via teacher code
 */
export const enrollmentSchema = z.object({
  teacherCode: z
    .string()
    .min(1, 'Teacher code is required')
    .regex(/^TEACH\d{3}$/, 'Invalid teacher code format. Should be TEACH###')
    .toUpperCase(),
});

// TypeScript type inferred from schema
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
