import { z } from 'zod'

/**
 * Body sent by the client.
 */
export const summarizeRequestSchema = z.object({
  text: z.string().min(1, 'Text must not be empty'),
  maxLength: z.number().int().positive().optional(),
})

/**
 * Successful response returned to the client.
 * (Feel free to expand the `usage` object with any extra fields
 * you surface from OpenAI.)
 */
export const summarizeResponseSchema = z.object({
  summary: z.string(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
    total_tokens: z.number(),
  }),
})

export type SummarizeReq = z.infer<typeof summarizeRequestSchema>
export type SummarizeRes = z.infer<typeof summarizeResponseSchema>