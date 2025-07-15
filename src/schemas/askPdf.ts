import { z } from 'zod'

/**
 * Request schema for asking questions about PDF content.
 * Note: The actual PDF file will be handled as multipart/form-data,
 * this schema is for the JSON portion of the request.
 */
export const askPdfRequestSchema = z.object({
  question: z.string().min(1, 'Question must not be empty'),
  maxLength: z.number().int().positive().optional().describe('Maximum length of the response'),
})

/**
 * Response schema for PDF question answering.
 */
export const askPdfResponseSchema = z.object({
  answer: z.string().describe('The answer extracted from the PDF content'),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(), 
    total_tokens: z.number(),
  }),
  pdfMetadata: z.object({
    numberOfPages: z.number().optional(),
    textLength: z.number().describe('Length of extracted text'),
  }),
})

export type AskPdfReq = z.infer<typeof askPdfRequestSchema>
export type AskPdfRes = z.infer<typeof askPdfResponseSchema>