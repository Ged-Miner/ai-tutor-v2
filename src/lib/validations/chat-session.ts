import { z } from 'zod';

/**
 * Schema for creating a new chat session
 */
export const createChatSessionSchema = z.object({
  lessonId: z.string().cuid('Invalid lesson ID'),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less').optional(),
});

/**
 * Schema for updating a chat session (rename)
 */
export const updateChatSessionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
});

// TypeScript types inferred from schemas
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type UpdateChatSessionInput = z.infer<typeof updateChatSessionSchema>;
