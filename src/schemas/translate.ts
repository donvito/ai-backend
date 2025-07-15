import { z } from 'zod'

export const translateRequestSchema = z.object({
  text: z.string().describe('Text to translate'),
  targetLanguage: z.string().describe('Target language code, e.g. "fr", "es", "zh" or full language name like "Spanish", "French"'),
  provider: z.enum(['openai', 'deepl']).optional().default('openai').describe('Translation provider to use (default: openai)'),
  sourceLanguage: z.string().optional().describe('Source language code (optional, auto-detected if not provided)')
})
