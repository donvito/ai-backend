import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { generateResponse } from '../services/openai'
import { handleError, handleValidationError } from '../utils/errorHandler'
import { askPdfRequestSchema, askPdfResponseSchema } from '../schemas/askPdf'

const router = new OpenAPIHono()

// Response schema for the AI answer
const answerSchema = z.object({
  answer: z.string().describe('The answer to the question based on the PDF content')
})

/**
 * Creates a prompt for answering questions based on PDF content
 */
function createPdfQuestionPrompt(pdfText: string, question: string, maxLength?: number): string {
  const lengthInstruction = maxLength 
    ? `Keep your answer concise and under ${maxLength} characters.` 
    : 'Provide a comprehensive but concise answer.'
  
  return `Based on the following PDF content, please answer the question.

PDF Content:
"""
${pdfText}
"""

Question: ${question}

Instructions:
- Answer based only on the information provided in the PDF content
- If the PDF doesn't contain information to answer the question, clearly state that
- ${lengthInstruction}
- Provide a direct, accurate answer`
}

/**
 * Extract text from PDF - placeholder implementation
 * TODO: Replace with proper PDF parsing library once environment is stable
 */
async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  try {
    // For now, return a placeholder response
    // In a production environment, you would use a proper PDF parsing library here
    const mockText = `This is a placeholder for PDF content extraction.
    
PDF File Size: ${buffer.length} bytes

To fully implement this feature, you would need to:
1. Install a PDF parsing library like pdf-parse, pdfjs-dist, or pdf-poppler
2. Handle the PDF binary data to extract text content
3. Parse pages and structure the text appropriately

For testing purposes, this endpoint will accept the question and provide a response based on this placeholder text.`

    return {
      text: mockText,
      numPages: 1
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF content')
  }
}

/**
 * Handler for PDF question answering endpoint
 */
async function handleAskPdfRequest(c: Context) {
  try {
    // Get the uploaded file and form data
    const body = await c.req.parseBody()
    const file = body['pdf'] as File
    const question = body['question'] as string
    const maxLengthStr = body['maxLength'] as string
    const maxLength = maxLengthStr ? parseInt(maxLengthStr) : undefined

    // Validate required fields
    if (!file) {
      return handleValidationError(c, 'PDF file')
    }

    if (!question) {
      return handleValidationError(c, 'Question')
    }

    // Validate file type
    if (!file.type?.includes('pdf') && !file.name?.toLowerCase().endsWith('.pdf')) {
      return handleValidationError(c, 'File', 'File must be a PDF')
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from PDF
    let pdfData
    try {
      pdfData = await extractTextFromPdf(buffer)
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError)
      return handleError(c, pdfError, 'Failed to parse PDF file. Please ensure it\'s a valid PDF.')
    }

    const pdfText = pdfData.text.trim()
    
    if (!pdfText) {
      return handleValidationError(c, 'PDF content', 'PDF appears to be empty or contains no readable text')
    }

    // Generate the prompt for AI
    const prompt = createPdfQuestionPrompt(pdfText, question, maxLength)

    // Get response using our OpenAI service
    const { data, usage } = await generateResponse(
      prompt,
      answerSchema
    )

    // Prepare metadata about the PDF
    const pdfMetadata = {
      numberOfPages: pdfData.numPages,
      textLength: pdfText.length,
    }

    return c.json({ 
      answer: data.answer,
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        total_tokens: usage.total_tokens,
      },
      pdfMetadata
    }, 200)
  } catch (error) {
    return handleError(c, error, 'Failed to process PDF question')
  }
}

// Define the OpenAPI route
router.openapi(
  createRoute({
    path: '/',
    method: 'post',
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              pdf: z.instanceof(File).describe('PDF file to analyze'),
              question: z.string().min(1).describe('Question to ask about the PDF content'),
              maxLength: z.string().optional().describe('Maximum length of the response (optional)'),
            })
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns an answer to the question based on the PDF content.',
        content: {
          'application/json': {
            schema: askPdfResponseSchema
          }
        }
      },
      400: {
        description: 'Bad request - missing file, question, or invalid PDF',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string()
            })
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string()
            })
          }
        }
      }
    }
  }), 
  handleAskPdfRequest as any
)

export default {
  handler: router,
  mountPath: 'ask-pdf'  // This will be mounted at /api/ask-pdf
}