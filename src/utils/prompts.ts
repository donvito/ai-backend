/**
 * System prompt template for summarization
 */
export function summarizePrompt(text: string, maxLength?: number): string {
  return `Summarize the following text${maxLength ? ` in ${maxLength} words or less` : ''}: ${text}`;
}

/**
 * System prompt template for keyword extraction
 */
export function keywordsPrompt(text: string, maxKeywords?: number): string {
  return `Extract the most important${maxKeywords ? ` ${maxKeywords}` : ''} keywords from the following text. Return them as a list of strings, with no explanations or extra text.

Text: ${text}`;
}

/**
 * System prompt for email reply generation
 */
export function emailReplyPrompt(emailContent: string, tone?: string): string {
  return `Generate a professional email reply to the following email${tone ? ` with a ${tone} tone` : ''}.
  
Email: ${emailContent}`;
}

/**
 * System prompt for tweet creation
 */
export function tweetPrompt(topic: string, style?: string): string {
  return `Create a tweet about the following topic${style ? ` in a ${style} style` : ''}.
  
Topic: ${topic}`;
}

/**
 * System prompt for translation
 */
export function translatePrompt(text: string, targetLanguage: string): string {
  return `Translate the following text to ${targetLanguage}. \n\nText: ${text}`;
}

/**
 * System prompt for image description
 */
export function imageDescriptionPrompt(imageUrl: string): string {
  return `Describe the following image in detail:
  
Image URL: ${imageUrl}`;
}

/**
 * System prompt for sentiment analysis
 */
export function sentimentPrompt(text: string, categories?: string[]): string {
  const defaultCategories = ['positive', 'negative', 'neutral'];
  const sentimentCategories = categories && categories.length > 0 ? categories : defaultCategories;
  
  return `Analyze the sentiment of the following text and return your response in JSON format.

Your response must include:
1. "sentiment": The overall sentiment classification (one of: ${sentimentCategories.join(', ')})
2. "confidence": A confidence score between 0 and 1 (where 1 is most confident)
3. "emotions": An array of emotion objects, each with "emotion" (string) and "score" (number 0-1)

The JSON keys must match exactly: "sentiment", "confidence", and "emotions".

Example response format:
{
  "sentiment": "positive",
  "confidence": 0.85,
  "emotions": [
    {"emotion": "joy", "score": 0.8},
    {"emotion": "excitement", "score": 0.6},
    {"emotion": "satisfaction", "score": 0.7}
  ]
}

Text to analyze: ${text}`;
}

/**
 * System prompt for image captioning
 */
export function imageCaptionPrompt(style?: string, maxLength?: number, includeDetails?: boolean): string {
  let prompt = 'Analyze this image and provide a natural language caption that describes what you see.';
  
  // Add style guidance
  if (style) {
    switch (style) {
      case 'descriptive':
        prompt += ' Focus on providing detailed visual descriptions of all elements in the image.';
        break;
      case 'concise':
        prompt += ' Keep the description brief and to the point, highlighting only the most important elements.';
        break;
      case 'creative':
        prompt += ' Use creative and engaging language to describe the scene, as if telling a story.';
        break;
      case 'technical':
        prompt += ' Focus on technical aspects like composition, lighting, camera angles, and photographic elements.';
        break;
    }
  }
  
  // Add length constraint
  if (maxLength) {
    prompt += ` Limit your response to ${maxLength} words or less.`;
  }
  
  // Add detail level
  if (includeDetails) {
    prompt += ' Include specific details about colors, textures, spatial relationships, and any text visible in the image.';
  }
  
  prompt += ' Provide only the caption without any additional commentary or explanation.';
  
  return prompt;
}
