import { z } from 'zod'

/**
 * Body sent by the client.
 */
export const keywordsRequestSchema = z.object({
  text: z.string().min(1, 'Text must not be empty'),
  maxKeywords: z.number().int().positive().optional(),
})

/**
 * Successful response returned to the client.
 */
export const keywordsResponseSchema = z.object({
  keywords: z.array(z.string()),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
    total_tokens: z.number(),
  }),
})

export type KeywordsReq = z.infer<typeof keywordsRequestSchema>
export type KeywordsRes = z.infer<typeof keywordsResponseSchema> 