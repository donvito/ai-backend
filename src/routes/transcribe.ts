import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { openai } from "../services/openai";

const router = new OpenAPIHono();

// Response schema for transcription
const transcribeResponseSchema = z.object({
  status: z.string().openapi({ example: "success" }),
  text: z.string().openapi({ example: "This is the transcribed text from the audio file." }),
  duration: z.number().optional().openapi({ example: 30.5, description: "Duration of the audio in seconds" }),
  language: z.string().optional().openapi({ example: "en", description: "Detected language of the audio" })
}).openapi("TranscribeResponse");

// Error response schema
const errorResponseSchema = z.object({
  status: z.string().openapi({ example: "error" }),
  message: z.string().openapi({ example: "Invalid audio file format" })
}).openapi("ErrorResponse");

// Define the transcribe route
const transcribeRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Transcribe audio file to text",
  description: "Upload an audio file and get back the transcribed text using OpenAI Whisper",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            audio: z.any().openapi({
              type: "string",
              format: "binary",
              description: "Audio file to transcribe (supports mp3, mp4, mpeg, mpga, m4a, wav, webm)"
            }),
            language: z.string().optional().openapi({
              example: "en",
              description: "Language code (optional, auto-detect if not provided)"
            }),
            prompt: z.string().optional().openapi({
              example: "This is a technical presentation about AI",
              description: "Optional text to guide the model's style"
            })
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Successfully transcribed audio file",
      content: {
        "application/json": {
          schema: transcribeResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid audio file or missing file",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
  tags: ["Audio"],
});

router.openapi(transcribeRoute, async (c) => {
  try {
    // Parse the multipart form data
    const body = await c.req.parseBody();
    const audioFile = body.audio as File;
    const language = body.language as string | undefined;
    const prompt = body.prompt as string | undefined;

    // Validate audio file
    if (!audioFile || typeof audioFile === 'string') {
      return c.json({
        status: "error",
        message: "No audio file provided or invalid file format"
      }, 400);
    }

    // Check file size (OpenAI has a 25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return c.json({
        status: "error",
        message: "Audio file too large. Maximum size is 25MB."
      }, 400);
    }

    // Check file type
    const supportedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 
      'audio/wav', 'audio/webm', 'video/mp4', 'video/mpeg'
    ];
    
    if (!supportedTypes.includes(audioFile.type) && !audioFile.name.match(/\.(mp3|mp4|mpeg|mpga|m4a|wav|webm)$/i)) {
      return c.json({
        status: "error",
        message: "Unsupported audio format. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm"
      }, 400);
    }

    // Prepare the transcription request
    const transcriptionParams: any = {
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json", // Get detailed response with timestamps
    };

    // Add optional parameters
    if (language) {
      transcriptionParams.language = language;
    }
    if (prompt) {
      transcriptionParams.prompt = prompt;
    }

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create(transcriptionParams);

    // Return the transcribed text
    return c.json({
      status: "success",
      text: transcription.text,
      duration: transcription.duration,
      language: transcription.language
    }, 200);

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Handle specific OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes('Unsupported file type')) {
        return c.json({
          status: "error",
          message: "Unsupported audio file format"
        }, 400);
      }
      
      if (error.message.includes('File too large')) {
        return c.json({
          status: "error",
          message: "Audio file too large"
        }, 400);
      }
    }

    return c.json({
      status: "error",
      message: "Failed to transcribe audio file"
    }, 500);
  }
});

export default {
  handler: router,
  mountPath: 'transcribe' // This will be mounted at /api/transcribe
};