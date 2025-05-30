import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const OPENAI_MODEL = 'gpt-4.1'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Define our usage type
export interface TokenUsage {
  input_tokens: number;
  input_tokens_details: {
    cached_tokens: number;
  };
  output_tokens: number;
  output_tokens_details: {
    reasoning_tokens: number;
  };
  total_tokens: number;
}

/**
 * Generate a response using OpenAI with structured output
 */
export async function generateResponse<T extends z.ZodType>(
  prompt: string,
  schema: T,
): Promise<{ 
  data: z.infer<T>; 
  usage: TokenUsage;
}> {
  const response = await openai.responses.parse({
    model: OPENAI_MODEL,
    input: [
      { role: "user", content: prompt }
    ],
    text: {
      format: zodTextFormat(schema, "result"),
    },
  });
  
  // Convert the usage data to our expected format
  const usage: TokenUsage = {
    input_tokens: 0,
    input_tokens_details: {
      cached_tokens: 0
    },
    output_tokens: 0,
    output_tokens_details: {
      reasoning_tokens: 0
    },
    total_tokens: 0
  }
  
  // Try to populate with real data if available
  if (response.usage) {
    // The new OpenAI SDK has different property names
    usage.total_tokens = response.usage.total_tokens || 0;
    // Estimate input/output tokens since specific breakdowns might not be available
    usage.input_tokens = Math.floor(usage.total_tokens * 0.7); // Estimate
    usage.output_tokens = usage.total_tokens - usage.input_tokens;
  }
  
  return {
    data: response.output_parsed,
    usage
  }
}

/**
 * Generate a tweet using OpenAI with web search capabilities
 */
export async function generateTweet(topic: string): Promise<{
  tweet: string;
  characterCount: number;
  author: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}> {
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        "role": "system",
        "content": [
          {
            "type": "input_text",
            "text": "You are a tweet creator\nYou search the web before creating a tweet\nYou always tweet using 3-5 phrases and use new lines\nYou will follow the topic the user mentions\nYou will always limit the post to 450 characters (leaving room for author signature)\nYou will NOT include any author signature in your tweet - this will be added automatically\n\nFOLLOW THE SAMPLE TWEETS BELOW\n\n<sample_tweet>\nGoogle just released an AI app builder 🔥🔥🔥\n\n@Firebase\n Studio — will it kill competition\n\nsee for yourself👇\n</sample_tweet>\n\n<sample_tweet>\nSonnet 4 is available in Cursor!    \n\nWe've been very impressed by its coding ability. It is much easier to control than 3.7 and is excellent at understanding codebases.\n\nIt appears to be a new state of the art.\n</sample_tweet>\n\n<sample_tweet>\nWave 9 is here: a frontier model built for software engineering.\n\nIntroducing our new family of models: SWE-1, SWE-1-lite, and SWE-1-mini.\n\nBased on internal evals, it has performance nearing that of frontier models from the foundation labs.\n\nAvailable now, only in Windsurf!\n</sample_tweet>"
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": topic
          }
        ]
      }
    ],
    text: {
      "format": {
        "type": "text"
      }
    },
    reasoning: {},
    tools: [
      {
        "type": "web_search_preview",
        "user_location": {
          "type": "approximate",
          "country": "US"
        },
        "search_context_size": "medium"
      }
    ],
    temperature: 1,
    max_output_tokens: 2048,
    top_p: 1,
    store: true
  });

  // Extract the tweet content from the response
  // Based on the actual OpenAI responses.create API response structure
  const baseTweet = (response as any).output?.[1]?.content?.[0]?.text || '';
  
  // Add author signature
  const author = "— @AITweetBot";
  const tweetWithAuthor = `${baseTweet}\n\n${author}`;
  const characterCount = tweetWithAuthor.length;

  // Convert usage data if available
  let usage;
  if ((response as any).usage) {
    const responseUsage = (response as any).usage;
    usage = {
      input_tokens: responseUsage.input_tokens || 0,
      output_tokens: responseUsage.output_tokens || 0,
      total_tokens: responseUsage.total_tokens || 0,
    };
  }

  return {
    tweet: tweetWithAuthor,
    characterCount,
    author,
    usage
  };
}

export { openai, OPENAI_MODEL } 
