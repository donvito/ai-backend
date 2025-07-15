import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { analyzeImage } from "../services/vision";
import { 
  analysisTypeSchema, 
  providerSchema, 
  visionAnalysisResponseSchema, 
  errorResponseSchema 
} from "../schemas/vision";

const router = new OpenAPIHono();

const analyzeImageRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            image: z.instanceof(File).openapi({
              description: "Image file to analyze (supported formats: JPEG, PNG, GIF, WebP)",
              format: "binary"
            }),
            analysisType: analysisTypeSchema.default("both"),
            provider: providerSchema
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Successfully analyzed the image",
      content: {
        "application/json": {
          schema: visionAnalysisResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid input",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    429: {
      description: "Rate limit exceeded",
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
  tags: ["Vision"],
});

router.openapi(analyzeImageRoute, async (c) => {
  try {
    const body = await c.req.parseBody();
    
    // Validate that we have an image file
    const imageFile = body.image;
    if (!imageFile || !(imageFile instanceof File)) {
      return c.json({
        error: "No image file provided",
        details: "Please provide an image file in the 'image' field"
      }, 400);
    }

    // Validate file type
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(imageFile.type)) {
      return c.json({
        error: "Unsupported file type",
        details: `Supported types: ${supportedTypes.join(', ')}`
      }, 400);
    }

    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return c.json({
        error: "File too large",
        details: "Maximum file size is 10MB"
      }, 400);
    }

    // Get analysis parameters
    const analysisType = (body.analysisType as string) || "both";
    const provider = body.provider as string | undefined;

    // Validate analysis type
    if (!["caption", "objects", "both"].includes(analysisType)) {
      return c.json({
        error: "Invalid analysis type",
        details: "Analysis type must be 'caption', 'objects', or 'both'"
      }, 400);
    }

    // Validate provider if specified
    if (provider && !["openai", "gemini"].includes(provider)) {
      return c.json({
        error: "Invalid provider",
        details: "Provider must be 'openai' or 'gemini'"
      }, 400);
    }

    // Convert file to ArrayBuffer
    const imageBuffer = await imageFile.arrayBuffer();

    // Analyze the image
    const result = await analyzeImage(
      imageBuffer,
      imageFile.type,
      analysisType as "caption" | "objects" | "both",
      provider as "openai" | "gemini" | undefined
    );

    return c.json(result, 200);

  } catch (error) {
    console.error("Error analyzing image:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return c.json({
          error: "API configuration error",
          details: error.message
        }, 500);
      }
      
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return c.json({
          error: "API rate limit exceeded",
          details: error.message
        }, 429);
      }
    }

    return c.json({
      error: "Internal server error",
      details: "An unexpected error occurred while analyzing the image"
    }, 500);
  }
});

export default {
  handler: router,
  mountPath: 'analyze-image'
};