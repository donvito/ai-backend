import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { generateImageCaption } from '../services/openai'
import { imageCaptionPrompt } from '../utils/prompts'
import { handleError, handleValidationError } from '../utils/errorHandler'
import { captionRequestSchema, captionResponseSchema } from '../schemas/caption'

const router = new OpenAPIHono()

/**
 * Handler for image captioning endpoint
 */
async function handleCaptionRequest(c: Context) {
  try {
    const { image, style, maxLength, includeDetails } = await c.req.json()

    if (!image) {
      return handleValidationError(c, 'Image')
    }

    // Generate the prompt based on parameters
    const prompt = imageCaptionPrompt(style, maxLength, includeDetails)

    // Get caption using our vision service
    const { caption, usage } = await generateImageCaption(image, prompt)

    if (!caption) {
      return c.json({ 
        error: 'Failed to generate caption for the image' 
      }, 500)
    }

    return c.json({ 
      caption,
      style: style || 'descriptive',
      usage
    }, 200)
  } catch (error) {
    return handleError(c, error, 'Failed to generate image caption')
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
            schema: captionRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns a natural language caption for the submitted image.',
        content: {
          'application/json': {
            schema: captionResponseSchema
          }
        }
      },
      400: {
        description: 'Bad request - invalid image data or parameters.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string()
            })
          }
        }
      },
      500: {
        description: 'Internal server error - failed to process image.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string()
            })
          }
        }
      }
    },
    tags: ['Vision AI']
  }), 
  handleCaptionRequest as any
)  

export default {
  handler: router,
  mountPath: 'caption-image'  // This will be mounted at /api/caption-image
}