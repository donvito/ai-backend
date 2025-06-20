import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { generateResponse } from '../services/openai'
import { keywordsPrompt } from '../utils/prompts'
import { handleError } from '../utils/errorHandler'
import { keywordsRequestSchema } from '../schemas/keywords'

const router = new OpenAPIHono()

const responseSchema = z.object({
  keywords: z.array(z.string()).describe('List of keywords extracted from the text')  
})

/**
 * Handler for keywords extraction endpoint
 */
async function handleKeywordsRequest(c: Context) {
  try {
    const body = await c.req.valid('json', keywordsRequestSchema)

    const prompt = keywordsPrompt(body.text, body.maxKeywords)

    // Get response using our service
    const { data, usage } = await generateResponse(
      prompt,
      responseSchema
    )

    return c.json({ 
      keywords: data.keywords,
      usage
    }, 200)
  } catch (error) {
    return handleError(c, error, 'Failed to extract keywords from text')
  }
} 

router.openapi(
  createRoute({
    path: '/',  // Changed from /keywords since we'll mount at /api/keywords
    method: 'post',
    request: {
      body: {
        content: {
          'application/json': {
            schema: keywordsRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns the extracted keywords.',
        content: {
          'application/json': {
            schema: responseSchema
          }
        }
      }
    }
  }), 
  handleKeywordsRequest
)  

export default {
  handler: router,
  mountPath: 'keywords'  // This will be mounted at /api/keywords
} 