import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export interface ModerationResult {
  flagged: boolean;
  safe_for_work: boolean;
  categories: {
    [key: string]: boolean;
  };
  category_scores: {
    [key: string]: number;
  };
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * Check if text is safe for work using OpenAI's moderation API
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  try {
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];
    
    // Calculate token usage - moderation API doesn't return usage, so we estimate
    const estimatedTokens = Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
    
    // Safe for work means not flagged for inappropriate content
    // We consider content unsafe if it's flagged for harassment, hate, sexual content, or violence
    const unsafeCategories = [
      'harassment',
      'harassment/threatening', 
      'hate',
      'hate/threatening',
      'sexual',
      'sexual/minors',
      'violence',
      'violence/graphic'
    ];
    
    const safeForWork = !result.flagged || !unsafeCategories.some(category => 
      result.categories[category as keyof typeof result.categories]
    );

    return {
      flagged: result.flagged,
      safe_for_work: safeForWork,
      categories: result.categories,
      category_scores: result.category_scores,
      usage: {
        promptTokens: estimatedTokens,
        totalTokens: estimatedTokens, // Moderation API only uses input tokens
      }
    };
  } catch (error) {
    console.error('Moderation API error:', error);
    throw new Error('Failed to moderate content');
  }
}