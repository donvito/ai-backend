import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { generateResponse } from '../services/openai'
import { summarizePrompt } from '../utils/prompts'
import { handleError } from '../utils/errorHandler'
import { summarizeRequestSchema } from '../schemas/summarize'

const router = new OpenAPIHono()

const responseSchema = z.object({
  summary: z.string().describe('The summary of the text')  
})

// Define the schema and handler for the summarize route
/**
 * Handler for text summarization endpoint
 */
async function handleSummarizeRequest(c: Context) {
  try {
    const body = await c.req.valid('json', summarizeRequestSchema)

    const prompt = summarizePrompt(body.text, body.maxLength)

    // Get response using our service
    const { data, usage } = await generateResponse(
      prompt,
      responseSchema
    )

    return c.json({ 
      summary: data.summary,
      usage
    }, 200)
  } catch (error) {
    return handleError(c, error, 'Failed to summarize text')
  }
} 

router.openapi(
  createRoute({
    path: '/',  // Changed from /summarize since we'll mount at /api/summarize
    method: 'post',
    request: {
      body: {
        content: {
          'application/json': {
            schema: summarizeRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns the summarized text.',
        content: {
          'application/json': {
            schema: responseSchema
          }
        }
      }
    }
  }), 
  handleSummarizeRequest
)  

export default {
  handler: router,
  mountPath: 'summarize'  // This will be mounted at /api/summarize
}
