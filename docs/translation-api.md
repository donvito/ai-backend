# Translation API Documentation

## Overview

The `/api/translate` endpoint provides text translation services using either OpenAI or DeepL as the translation provider. It supports multiple languages and provides detailed usage statistics.

## Endpoint

**POST** `/api/translate`

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The text to translate |
| `targetLanguage` | string | Yes | Target language code (e.g., "es", "fr", "zh") or full language name (e.g., "Spanish", "French") |
| `provider` | string | No | Translation provider: "openai" (default) or "deepl" |
| `sourceLanguage` | string | No | Source language code (optional, auto-detected if not provided) |

## Response

```json
{
  "translatedText": "string",
  "provider": "openai|deepl",
  "detectedSourceLanguage": "string (DeepL only)",
  "usage": {
    // OpenAI usage (when provider = "openai")
    "input_tokens": 10,
    "output_tokens": 5,
    "total_tokens": 15,
    
    // DeepL usage (when provider = "deepl")
    "characterCount": 25,
    "characterLimit": 500000
  }
}
```

## Examples

### Basic Translation (OpenAI - Default)

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "targetLanguage": "Spanish"
  }'
```

**Response:**
```json
{
  "translatedText": "Hola, ¿cómo estás?",
  "provider": "openai",
  "usage": {
    "input_tokens": 15,
    "output_tokens": 8,
    "total_tokens": 23
  }
}
```

### DeepL Translation with Source Language

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "targetLanguage": "es",
    "provider": "deepl",
    "sourceLanguage": "en"
  }'
```

**Response:**
```json
{
  "translatedText": "Hola, ¿cómo estás?",
  "provider": "deepl",
  "detectedSourceLanguage": "EN",
  "usage": {
    "characterCount": 19,
    "characterLimit": 500000
  }
}
```

### Using Full Language Names

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Good morning!",
    "targetLanguage": "French",
    "provider": "deepl"
  }'
```

## Supported Languages

### OpenAI
OpenAI supports a wide range of languages including but not limited to:
- English, Spanish, French, German, Italian, Portuguese
- Chinese (Simplified/Traditional), Japanese, Korean
- Russian, Arabic, Hindi, Dutch, Swedish, Norwegian
- And many more...

### DeepL
DeepL supports the following languages:
- **European**: English, German, French, Italian, Spanish, Portuguese, Dutch, Polish, Russian, Czech, Danish, Finnish, Greek, Hungarian, Latvian, Lithuanian, Slovak, Slovenian, Swedish, Estonian, Bulgarian, Romanian
- **Asian**: Japanese, Chinese (Simplified), Korean
- **Other**: Arabic, Turkish, Ukrainian, Norwegian (Bokmål), Indonesian

## Environment Setup

### Required Environment Variables

```bash
# OpenAI API Key (required for OpenAI provider)
OPENAI_API_KEY=your_openai_api_key_here

# DeepL API Key (required for DeepL provider)
DEEPL_API_KEY=your_deepl_api_key_here

# Application token (required)
DEFAULT_ACCESS_TOKEN=your_secure_token

# Development mode (disables authentication)
NODE_ENV=development
```

### Setting up API Keys

#### OpenAI API Key
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your environment variables

#### DeepL API Key
1. Visit [DeepL API](https://www.deepl.com/pro-api)
2. Sign up for a DeepL Pro account
3. Get your API key from the account settings
4. Add it to your environment variables

## Features

### Provider Fallback
If DeepL translation fails (e.g., due to API limits or network issues), the system automatically falls back to OpenAI translation.

### Language Code Normalization
The API accepts both:
- **Language codes**: "es", "fr", "de", "zh"
- **Full language names**: "Spanish", "French", "German", "Chinese"

### Usage Tracking
The API returns detailed usage information:
- **OpenAI**: Token usage (input, output, total)
- **DeepL**: Character count and remaining character limit

### Auto-Detection
When using DeepL, source language auto-detection is available and the detected language is returned in the response.

## Error Handling

### Common Error Responses

```json
{
  "error": "Failed to translate text"
}
```

### Possible Causes
- Invalid or missing API keys
- Unsupported language combinations
- API rate limits exceeded
- Network connectivity issues
- Invalid request format

## Authentication

### Development Mode
When `NODE_ENV=development`, no authentication is required.

### Production Mode
In production, include the API key in the header:
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"text": "Hello", "targetLanguage": "Spanish"}'
```

## Best Practices

1. **Choose the right provider**:
   - Use **DeepL** for European languages and high-quality translations
   - Use **OpenAI** for broader language support and context-aware translations

2. **Optimize costs**:
   - Monitor usage statistics in responses
   - Consider caching translations for repeated content
   - Use appropriate source language specification to improve accuracy

3. **Handle errors gracefully**:
   - Implement retry logic for transient failures
   - Have fallback strategies when one provider is unavailable

4. **Language specification**:
   - Use ISO language codes for consistency
   - Specify source language when known for better accuracy