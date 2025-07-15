import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { generateResponse } from '../services/openai'
import { generateCodePrompt } from '../utils/prompts'
import { handleError, handleValidationError } from '../utils/errorHandler'
import { generateCodeRequestSchema } from '../schemas/generateCode'

const router = new OpenAPIHono()

const responseSchema = z.object({
  code: z.string().describe('The generated code snippet'),
  language: z.string().describe('The programming language of the generated code'),
  explanation: z.string().describe('Brief explanation of what the code does')
})

/**
 * Handler for code generation endpoint
 */
async function handleGenerateCodeRequest(c: Context) {
  try {
    const { prompt, language, framework, complexity, includeComments } = await c.req.json()

    if (!prompt) {
      return handleValidationError(c, 'Prompt')
    }

    // Generate the prompt for code generation
    const systemPrompt = generateCodePrompt(prompt, language, framework, complexity, includeComments)

    // Get response using our service
    const { data, usage } = await generateResponse(
      systemPrompt,
      responseSchema
    )

    return c.json({ 
      code: data.code,
      language: data.language,
      explanation: data.explanation,
      usage
    }, 200)
  } catch (error) {
    return handleError(c, error, 'Failed to generate code')
  }
} 

router.openapi(
  createRoute({
    path: '/',
    method: 'post',
    request: {
      body: {
        content: {
          'application/json': {
            schema: generateCodeRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns the generated code snippet with explanation.',
        content: {
          'application/json': {
            schema: responseSchema
          }
        }
      }
    }
  }), 
  handleGenerateCodeRequest as any
)  

export default {
  handler: router,
  mountPath: 'generate-code'  // This will be mounted at /api/generate-code
}