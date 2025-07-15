import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export interface VisionAnalysisResult {
  provider: "openai" | "gemini";
  caption?: string;
  objects?: Array<{
    name: string;
    confidence?: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  analysis: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export type AnalysisType = "caption" | "objects" | "both";

/**
 * Convert image file to base64 data URL
 */
function imageToBase64DataUrl(buffer: ArrayBuffer, mimeType: string): string {
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Analyze image using OpenAI Vision
 */
export async function analyzeImageWithOpenAI(
  imageBuffer: ArrayBuffer,
  mimeType: string,
  analysisType: AnalysisType = "both"
): Promise<VisionAnalysisResult> {
  const base64Image = imageToBase64DataUrl(imageBuffer, mimeType);
  
  let prompt = "";
  switch (analysisType) {
    case "caption":
      prompt = "Please provide a detailed caption/description of this image.";
      break;
    case "objects":
      prompt = "Please identify and list all objects visible in this image. For each object, provide the name and if possible, estimate confidence and approximate location.";
      break;
    case "both":
      prompt = "Please analyze this image by: 1) Providing a detailed caption/description, and 2) Identifying and listing all objects visible in the image with their approximate locations if possible.";
      break;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  const analysis = response.choices[0]?.message?.content || "";
  
  // Parse the analysis to extract caption and objects
  const result: VisionAnalysisResult = {
    provider: "openai",
    analysis,
    usage: response.usage ? {
      input_tokens: response.usage.prompt_tokens,
      output_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
    } : undefined,
  };

  // Simple parsing to extract caption and objects
  if (analysisType === "caption" || analysisType === "both") {
    result.caption = analysis;
  }

  if (analysisType === "objects" || analysisType === "both") {
    // Try to extract object mentions (this is a simple implementation)
    const objectMatches = analysis.match(/(?:objects?|items?|things?)[\s\S]*?(?:\n|$)/gi);
    if (objectMatches) {
      result.objects = objectMatches.map(match => ({
        name: match.trim(),
        confidence: undefined,
      }));
    }
  }

  return result;
}

/**
 * Analyze image using Gemini Vision
 */
export async function analyzeImageWithGemini(
  imageBuffer: ArrayBuffer,
  mimeType: string,
  analysisType: AnalysisType = "both"
): Promise<VisionAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let prompt = "";
  switch (analysisType) {
    case "caption":
      prompt = "Please provide a detailed caption/description of this image.";
      break;
    case "objects":
      prompt = "Please identify and list all objects visible in this image. For each object, provide the name and if possible, estimate confidence and approximate location.";
      break;
    case "both":
      prompt = "Please analyze this image by: 1) Providing a detailed caption/description, and 2) Identifying and listing all objects visible in the image with their approximate locations if possible.";
      break;
  }

  const imagePart = {
    inlineData: {
      data: Buffer.from(imageBuffer).toString('base64'),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const analysis = response.text();

  const visionResult: VisionAnalysisResult = {
    provider: "gemini",
    analysis,
  };

  // Parse the analysis to extract caption and objects
  if (analysisType === "caption" || analysisType === "both") {
    visionResult.caption = analysis;
  }

  if (analysisType === "objects" || analysisType === "both") {
    // Try to extract object mentions (this is a simple implementation)
    const objectMatches = analysis.match(/(?:objects?|items?|things?)[\s\S]*?(?:\n|$)/gi);
    if (objectMatches) {
      visionResult.objects = objectMatches.map(match => ({
        name: match.trim(),
        confidence: undefined,
      }));
    }
  }

  return visionResult;
}

/**
 * Analyze image using the specified provider or automatically choose one
 */
export async function analyzeImage(
  imageBuffer: ArrayBuffer,
  mimeType: string,
  analysisType: AnalysisType = "both",
  provider?: "openai" | "gemini"
): Promise<VisionAnalysisResult> {
  // Auto-select provider if not specified
  if (!provider) {
    if (OPENAI_API_KEY) {
      provider = "openai";
    } else if (GEMINI_API_KEY) {
      provider = "gemini";
    } else {
      throw new Error("No vision API keys configured. Please set OPENAI_API_KEY or GEMINI_API_KEY environment variables.");
    }
  }

  // Validate API key is available for the selected provider
  if (provider === "openai" && !OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }
  
  if (provider === "gemini" && !GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.");
  }

  // Call the appropriate provider
  switch (provider) {
    case "openai":
      return analyzeImageWithOpenAI(imageBuffer, mimeType, analysisType);
    case "gemini":
      return analyzeImageWithGemini(imageBuffer, mimeType, analysisType);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}