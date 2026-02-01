import { z } from 'zod';

// Available models
export const AI_MODELS = ['gpt-5.2', 'gpt-5-mini', 'gpt-5-nano'] as const;

// Reasoning levels (GPT-5 supported values: minimal, low, medium, high)
export const REASONING_LEVELS = ['high', 'medium', 'low', 'minimal'] as const;

// Verbosity levels
export const VERBOSITY_LEVELS = ['high', 'medium', 'low'] as const;

// AI Types
export const AI_TYPES = ['TRANSCRIPT', 'CHATBOT'] as const;

// Base schema for AI settings (shared fields)
export const baseAISettingSchema = z.object({
  model: z.enum(AI_MODELS),
  reasoning: z.enum(REASONING_LEVELS),
  verbosity: z.enum(VERBOSITY_LEVELS),
});

// Schema for transcript AI setting (no streaming)
export const transcriptAISettingSchema = baseAISettingSchema;

// Schema for chatbot AI setting (includes streaming and message limit)
export const chatbotAISettingSchema = baseAISettingSchema.extend({
  streaming: z.boolean(),
  maxMessagesPerChat: z.number().int().positive().nullable(),
});

// Schema for updating AI settings (both types at once)
export const updateAISettingsSchema = z.object({
  transcript: transcriptAISettingSchema,
  chatbot: chatbotAISettingSchema,
});

// Legacy alias for backward compatibility
export const aiSettingSchema = baseAISettingSchema;

export type AIModel = (typeof AI_MODELS)[number];
export type ReasoningLevel = (typeof REASONING_LEVELS)[number];
export type VerbosityLevel = (typeof VERBOSITY_LEVELS)[number];
export type AIType = (typeof AI_TYPES)[number];
export type AISetting = z.infer<typeof aiSettingSchema>;
export type TranscriptAISetting = z.infer<typeof transcriptAISettingSchema>;
export type ChatbotAISetting = z.infer<typeof chatbotAISettingSchema>;
export type UpdateAISettingsInput = z.infer<typeof updateAISettingsSchema>;
