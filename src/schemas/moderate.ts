import { z } from 'zod';

/**
 * Moderation request schema
 */
export const ModerationRequestSchema = z.object({
  text: z.string().min(1, 'Text must not be empty').max(32768, 'Text must not exceed 32,768 characters'),
});

/**
 * Moderation response schema
 */
export const ModerationResponseSchema = z.object({
  flagged: z.boolean(),
  safe_for_work: z.boolean(),
  categories: z.object({
    harassment: z.boolean(),
    'harassment/threatening': z.boolean(),
    hate: z.boolean(),
    'hate/threatening': z.boolean(),
    'self-harm': z.boolean(),
    'self-harm/intent': z.boolean(),
    'self-harm/instructions': z.boolean(),
    sexual: z.boolean(),
    'sexual/minors': z.boolean(),
    violence: z.boolean(),
    'violence/graphic': z.boolean(),
  }),
  category_scores: z.object({
    harassment: z.number(),
    'harassment/threatening': z.number(),
    hate: z.number(),
    'hate/threatening': z.number(),
    'self-harm': z.number(),
    'self-harm/intent': z.number(),
    'self-harm/instructions': z.number(),
    sexual: z.number(),
    'sexual/minors': z.number(),
    violence: z.number(),
    'violence/graphic': z.number(),
  }),
  usage: z.object({
    promptTokens: z.number(),
    totalTokens: z.number(),
  }),
});

export type ModerationReq = z.infer<typeof ModerationRequestSchema>;
export type ModerationRes = z.infer<typeof ModerationResponseSchema>;