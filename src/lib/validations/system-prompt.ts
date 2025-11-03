import { z } from 'zod';

/**
 * Schema for creating a system prompt
 */
export const createSystemPromptSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must contain fewer than 100 characters')
    .regex(/^[a-z0-9_]+$/, 'Name must contain lowercase letters, numbers, and underscores only (e.g., default_tutor_prompt)'),

  content: z
    .string()
    .min(10, 'Content must contain at least 10 characters')
    .max(10000, 'Content must contain fewer than 10,000 characters'),

  isActive: z.boolean().default(true),
});

/**
 * Schema for updating a system prompt
 */
export const updateSystemPromptSchema = z.object({
  content: z
    .string()
    .min(10, 'Content must contain at least 10 characters')
    .max(10000, 'Content must contain fewer than 10,000 characters'),

  isActive: z.boolean(),
});

export type CreateSystemPromptInput = z.infer<typeof createSystemPromptSchema>;
export type UpdateSystemPromptInput = z.infer<typeof updateSystemPromptSchema>;
