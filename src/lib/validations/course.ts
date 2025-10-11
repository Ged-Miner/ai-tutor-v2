import { z } from 'zod';

/**
 * Schema for creating a new course
 */
export const createCourseSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .max(100, 'Course name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  settings: z
    .object({
      // Future settings can go here
      // e.g., allowLateEnrollment: z.boolean(),
      // maxStudents: z.number().optional(),
    })
    .optional(),
});

/**
 * Schema for updating an existing course
 * All fields are optional for partial updates
 */
export const updateCourseSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .max(100, 'Course name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  settings: z
    .object({
      // Future settings
    })
    .optional(),
});

// TypeScript types inferred from schemas
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
