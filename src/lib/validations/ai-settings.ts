import { z } from 'zod';

// Common/suggested models (for UI hints - not enforced)
export const SUGGESTED_MODELS = ['gpt-5.2', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'gpt-4o-mini'] as const;

// Default fallback model if an invalid model is specified
export const FALLBACK_MODEL = 'gpt-5-nano';

// Reasoning levels (OpenAI supported values: none, minimal, low, medium, high)
export const REASONING_LEVELS = ['high', 'medium', 'low', 'minimal', 'none'] as const;

// Default fallback reasoning level when 'none' is not supported
export const FALLBACK_REASONING = 'minimal';

// Models known to NOT support 'none' reasoning (blocklist approach)
// These models only support: minimal, low, medium, high
export const MODELS_WITHOUT_NONE_REASONING = [
  'gpt-5-nano',
  'gpt-5-mini',
  'gpt-4o',
  'gpt-4o-mini',
] as const;

// Helper to check if a model supports 'none' reasoning
export function supportsNoneReasoning(model: string): boolean {
  // Check if the model matches any in the blocklist (case-insensitive, partial match)
  const lowerModel = model.toLowerCase();
  return !MODELS_WITHOUT_NONE_REASONING.some(blocked =>
    lowerModel.includes(blocked.toLowerCase())
  );
}

// Verbosity levels
export const VERBOSITY_LEVELS = ['high', 'medium', 'low'] as const;

// AI Types
export const AI_TYPES = ['TRANSCRIPT', 'CHATBOT'] as const;

// Base schema for AI settings (shared fields)
// Model accepts any string to allow arbitrary/future models
export const baseAISettingSchema = z.object({
  model: z.string().min(1, 'Model name is required').max(100, 'Model name too long'),
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

export type AIModel = string; // Now accepts any model name
export type ReasoningLevel = (typeof REASONING_LEVELS)[number];
export type VerbosityLevel = (typeof VERBOSITY_LEVELS)[number];
export type AIType = (typeof AI_TYPES)[number];
export type AISetting = z.infer<typeof aiSettingSchema>;
export type TranscriptAISetting = z.infer<typeof transcriptAISettingSchema>;
export type ChatbotAISetting = z.infer<typeof chatbotAISettingSchema>;
export type UpdateAISettingsInput = z.infer<typeof updateAISettingsSchema>;
