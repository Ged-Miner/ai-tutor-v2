import { z } from 'zod';

/**
 * Validation schema for creating a new user
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT'], {
    errorMap: () => ({ message: 'Role must be ADMIN, TEACHER, or STUDENT' }),
  }),
  teacherCode: z
    .string()
    .length(8, 'Teacher code must be exactly 8 characters')
    .regex(/^TEACH\d{3}$/, 'Teacher code must follow format: TEACHxxx')
    .optional()
    .nullable(),
});

/**
 * Validation schema for updating a user
 */
export const updateUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .optional(),
  role: z
    .enum(['ADMIN', 'TEACHER', 'STUDENT'])
    .optional(),
  teacherCode: z
    .string()
    .length(8, 'Teacher code must be exactly 8 characters')
    .regex(/^TEACH\d{3}$/, 'Teacher code must follow format: TEACHxxx')
    .optional()
    .nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
