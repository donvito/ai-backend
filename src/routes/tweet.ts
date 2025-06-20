import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { generateTweet } from '../services/openai'
import { handleError } from '../utils/errorHandler'
import { tweetRequestSchema, tweetResponseSchema } from '../schemas/tweet'

const router = new OpenAPIHono()

/**
 * Handler for tweet creation endpoint
 */
async function handleTweetRequest(c: Context) {
  try {
    const body = await c.req.valid('json', tweetRequestSchema)

    // Generate the tweet using our service
    const { tweet, characterCount, author, usage } = await generateTweet(body.topic)

    return c.json({ 
      tweet,
      characterCount,
      author,
      usage
    }, 200)
  } catch (error) {
    return handleError(c, error, 'Failed to generate tweet')
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
            schema: tweetRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns the generated tweet.',
        content: {
          'application/json': {
            schema: tweetResponseSchema
          }
        }
      }
    },
    tags: ['Tweet'], // Group in Swagger UI
  }), 
  handleTweetRequest
)  

export default {
  handler: router,
  mountPath: 'tweet'  // This will be mounted at /api/tweet
} 