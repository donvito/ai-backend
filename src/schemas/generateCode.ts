import { z } from 'zod'

/**
 * Body sent by the client for code generation.
 */
export const generateCodeRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt must not be empty'),
  language: z.string().optional().describe('Programming language for the code (e.g., javascript, python, typescript)'),
  framework: z.string().optional().describe('Framework or library to use (e.g., react, express, django)'),
  complexity: z.enum(['simple', 'intermediate', 'advanced']).optional().default('intermediate'),
  includeComments: z.boolean().optional().default(true),
})

/**
 * Successful response returned to the client.
 */
export const generateCodeResponseSchema = z.object({
  code: z.string(),
  language: z.string(),
  explanation: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
})

export type GenerateCodeReq = z.infer<typeof generateCodeRequestSchema>
export type GenerateCodeRes = z.infer<typeof generateCodeResponseSchema>