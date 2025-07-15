import { z } from 'zod'

/**
 * Request schema for image captioning.
 * Accepts either a base64 encoded image or an image URL.
 */
export const captionRequestSchema = z.object({
  // Either base64 image data or image URL
  image: z.string().min(1, 'Image data or URL must not be empty').describe('Base64 encoded image data (with data:image/... prefix) or image URL'),
  // Optional parameters for customizing the caption
  style: z.enum(['descriptive', 'concise', 'creative', 'technical']).optional().describe('Style of the caption'),
  maxLength: z.number().int().positive().max(500).optional().describe('Maximum length of the caption in words'),
  includeDetails: z.boolean().optional().default(false).describe('Whether to include detailed technical information about the image')
})

/**
 * Successful response returned to the client.
 */
export const captionResponseSchema = z.object({
  caption: z.string().describe('Natural language caption for the image'),
  style: z.string().optional().describe('Style used for generating the caption'),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(), 
    total_tokens: z.number(),
  }).optional()
})

export type CaptionReq = z.infer<typeof captionRequestSchema>
export type CaptionRes = z.infer<typeof captionResponseSchema>