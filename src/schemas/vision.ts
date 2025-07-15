import { z } from "zod";

export const analysisTypeSchema = z.enum(["caption", "objects", "both"]).openapi({
  description: "Type of analysis to perform on the image",
  example: "both"
});

export const providerSchema = z.enum(["openai", "gemini"]).optional().openapi({
  description: "Vision API provider to use. If not specified, will auto-select based on available API keys",
  example: "openai"
});

export const objectSchema = z.object({
  name: z.string().openapi({
    description: "Name of the detected object",
    example: "car"
  }),
  confidence: z.number().optional().openapi({
    description: "Confidence score for the detection (0-1)",
    example: 0.95
  }),
  boundingBox: z.object({
    x: z.number().openapi({ description: "X coordinate of top-left corner" }),
    y: z.number().openapi({ description: "Y coordinate of top-left corner" }),
    width: z.number().openapi({ description: "Width of the bounding box" }),
    height: z.number().openapi({ description: "Height of the bounding box" })
  }).optional().openapi({
    description: "Bounding box coordinates for the detected object"
  })
}).openapi("DetectedObject");

export const usageSchema = z.object({
  input_tokens: z.number().openapi({
    description: "Number of input tokens used",
    example: 150
  }),
  output_tokens: z.number().openapi({
    description: "Number of output tokens generated",
    example: 75
  }),
  total_tokens: z.number().openapi({
    description: "Total number of tokens used",
    example: 225
  })
}).openapi("TokenUsage");

export const visionAnalysisResponseSchema = z.object({
  provider: z.enum(["openai", "gemini"]).openapi({
    description: "The vision API provider that was used",
    example: "openai"
  }),
  caption: z.string().optional().openapi({
    description: "Generated caption/description of the image",
    example: "A red car parked in front of a blue building on a sunny day"
  }),
  objects: z.array(objectSchema).optional().openapi({
    description: "List of detected objects in the image"
  }),
  analysis: z.string().openapi({
    description: "Full analysis text from the AI model",
    example: "This image shows a red sedan parked in front of a modern blue office building..."
  }),
  usage: usageSchema.optional().openapi({
    description: "Token usage information"
  })
}).openapi("VisionAnalysisResponse");

export const errorResponseSchema = z.object({
  error: z.string().openapi({
    description: "Error message",
    example: "No vision API keys configured"
  }),
  details: z.string().optional().openapi({
    description: "Additional error details"
  })
}).openapi("ErrorResponse");