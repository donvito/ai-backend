import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { generateResponse } from '../services/openai'
import { translateWithDeepL } from '../services/deepl'
import { translatePrompt } from '../utils/prompts'
import { handleError, handleValidationError } from '../utils/errorHandler'
import { translateRequestSchema } from '../schemas/translate'

const router = new OpenAPIHono()

const responseSchema = z.object({
  translatedText: z.string().describe('Translated text in the target language'),
  provider: z.string().describe('Translation provider used'),
  detectedSourceLanguage: z.string().optional().describe('Detected source language (DeepL only)'),
  usage: z.object({
    input_tokens: z.number().optional().describe('Input tokens used (OpenAI only)'),
    output_tokens: z.number().optional().describe('Output tokens used (OpenAI only)'),
    total_tokens: z.number().optional().describe('Total tokens used (OpenAI only)'),
    characterCount: z.number().optional().describe('Character count (DeepL only)'),
    characterLimit: z.number().optional().describe('Character limit (DeepL only)')
  }).optional()
})

/**
 * Handler for translation endpoint
 */
async function handleTranslateRequest(c: Context) {
  try {
    const { text, targetLanguage, provider = 'openai', sourceLanguage } = await c.req.json()

    if (!text) {
      return handleValidationError(c, 'Text')
    }
    if (!targetLanguage) {
      return handleValidationError(c, 'Target language')
    }

    let translatedText: string;
    let detectedSourceLanguage: string | undefined;
    let usage: any = {};

    if (provider === 'deepl') {
      // Use DeepL for translation
      try {
        const result = await translateWithDeepL(text, targetLanguage, sourceLanguage);
        translatedText = result.translatedText;
        detectedSourceLanguage = result.detectedSourceLanguage;
        usage = result.usage;
      } catch (error) {
        // Fallback to OpenAI if DeepL fails
        console.warn('DeepL translation failed, falling back to OpenAI:', error);
        const prompt = translatePrompt(text, targetLanguage);
        const openaiResponseSchema = z.object({
          translatedText: z.string().describe('Translated text in the target language')
        });
        const openaiResult = await generateResponse(prompt, openaiResponseSchema);
        translatedText = openaiResult.data.translatedText;
        usage = openaiResult.usage;
      }
    } else {
      // Use OpenAI for translation
      const prompt = translatePrompt(text, targetLanguage);
      const openaiResponseSchema = z.object({
        translatedText: z.string().describe('Translated text in the target language')
      });
      const { data, usage: openaiUsage } = await generateResponse(prompt, openaiResponseSchema);
      translatedText = data.translatedText;
      usage = openaiUsage;
    }

    const response: any = {
      translatedText,
      provider,
      usage
    };

    if (detectedSourceLanguage) {
      response.detectedSourceLanguage = detectedSourceLanguage;
    }

    return c.json(response, 200)
  } catch (error) {
    return handleError(c, error, 'Failed to translate text')
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
            schema: translateRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Returns the translated text with provider information and usage stats.',
        content: {
          'application/json': {
            schema: responseSchema
          }
        }
      }
    }
  }),
  handleTranslateRequest as any
)

export default {
  handler: router,
  mountPath: 'translate' // Mounted at /api/translate
}
