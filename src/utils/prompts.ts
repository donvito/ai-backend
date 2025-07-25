/**
 * System prompt template for summarization
 */
export function summarizePrompt(text: string, maxLength?: number): string {
  return `Summarize the following text${maxLength ? ` in ${maxLength} words or less. Just return the summary, no other text or explanation.` : ''}: ${text}`;
}

/**
 * System prompt template for keyword extraction
 */
export function keywordsPrompt(text: string, maxKeywords?: number): string {
  return `Extract the most important${maxKeywords ? ` ${maxKeywords}` : ''} keywords from the following text.

Text: ${text}`;
}

/**
 * System prompt for email reply generation
 */
export function emailReplyPrompt(emailContent: string, tone?: string): string {
  return `Generate a professional email reply to the following email${tone ? ` with a ${tone} tone. Just return the reply, no other text or explanation.` : ''}.
  
Email: ${emailContent}`;
}

/**
 * System prompt for tweet creation
 */
export function tweetPrompt(topic: string, style?: string): string {
  return `Create ONE tweet about the following topic ${topic}. Use 3-5 phrases with new lines. Keep it under 450 characters. Just return the tweet, no other text or explanation.`;
}

/**
 * System prompt for translation
 */
export function translatePrompt(text: string, targetLanguage: string): string {
  return `Translate the following text to ${targetLanguage}. Text: ${text} Just return the translated text, no other text or explanation.`;
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
