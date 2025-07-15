import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { Context } from 'hono'
import { moderateText } from '../services/moderation'
import { handleError, handleValidationError } from '../utils/errorHandler'
import { ModerationRequestSchema, ModerationResponseSchema } from '../schemas/moderate'

const router = new OpenAPIHono()

/**
 * Handler for content moderation endpoint
 */
async function handleModerationRequest(c: Context) {
  try {
    const body = await c.req.json()
    
    // Validate text field
    if (!body.text) {
      return handleValidationError(c, 'Text')
    }
    
    if (typeof body.text !== 'string') {
      return handleValidationError(c, 'Text', 'Text must be a string')
    }
    
    if (body.text.trim().length === 0) {
      return handleValidationError(c, 'Text', 'Text must not be empty')
    }
    
    if (body.text.length > 32768) {
      return handleValidationError(c, 'Text', 'Text must not exceed 32,768 characters')
    }

    const { text } = body

    try {
      // Moderate the content using OpenAI's moderation API
      const result = await moderateText(text)

      return c.json({
        flagged: result.flagged,
        safe_for_work: result.safe_for_work,
        categories: result.categories,
        category_scores: result.category_scores,
        usage: {
          promptTokens: result.usage.promptTokens,
          totalTokens: result.usage.totalTokens
        }
      }, 200)
    } catch (err) {
      return handleError(c, err, 'Failed to moderate content')
    }
  } catch (error) {
    return handleError(c, error, 'Failed to process request')
  }
}

router.openapi(
  createRoute({
    path: '/',
    method: 'post',
    tags: ['Moderation'],
    summary: 'Content Moderation',
    description: 'Check if input text is safe for work using OpenAI\'s moderation API. Returns flagged status, safe-for-work assessment, and detailed category breakdown.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: ModerationRequestSchema,
            example: {
              text: "This is a sample text to check if it's appropriate for workplace use."
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns content moderation results with safe-for-work assessment.',
        content: {
          'application/json': {
            schema: ModerationResponseSchema,
            example: {
              flagged: false,
              safe_for_work: true,
              categories: {
                harassment: false,
                'harassment/threatening': false,
                hate: false,
                'hate/threatening': false,
                'self-harm': false,
                'self-harm/intent': false,
                'self-harm/instructions': false,
                sexual: false,
                'sexual/minors': false,
                violence: false,
                'violence/graphic': false
              },
              category_scores: {
                harassment: 0.001,
                'harassment/threatening': 0.0001,
                hate: 0.0002,
                'hate/threatening': 0.00001,
                'self-harm': 0.00005,
                'self-harm/intent': 0.00003,
                'self-harm/instructions': 0.00001,
                sexual: 0.0001,
                'sexual/minors': 0.000001,
                violence: 0.0002,
                'violence/graphic': 0.00001
              },
              usage: {
                promptTokens: 15,
                totalTokens: 15
              }
            }
          }
        }
      },
      400: {
        description: 'Bad request - invalid input',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' }
              }
            }
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }), 
  handleModerationRequest as any
)

export default {
  handler: router,
  mountPath: 'moderate'
}