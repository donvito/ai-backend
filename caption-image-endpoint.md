# Image Captioning Endpoint - `/api/caption-image`

## Overview

The `/caption-image` endpoint uses OpenAI's GPT-4 Vision model to generate natural language captions for submitted images. It supports both image URLs and base64-encoded image data, with customizable captioning styles and parameters.

## Endpoint Details

- **URL**: `POST /api/caption-image`
- **Content-Type**: `application/json`
- **Authentication**: Not required in development mode

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | Yes | Base64 encoded image data (with `data:image/...` prefix) or image URL |
| `style` | string | No | Caption style: `descriptive`, `concise`, `creative`, or `technical` |
| `maxLength` | number | No | Maximum length of caption in words (1-500) |
| `includeDetails` | boolean | No | Whether to include detailed technical information (default: false) |

## Response Format

```json
{
  "caption": "A detailed description of what's shown in the image",
  "style": "descriptive",
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 45,
    "total_tokens": 1295
  }
}
```

## Usage Examples

### 1. Basic Image Captioning with URL

```bash
curl -X POST http://localhost:3000/api/caption-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://example.com/path/to/image.jpg"
  }'
```

### 2. Base64 Image with Custom Style

```bash
curl -X POST http://localhost:3000/api/caption-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...",
    "style": "creative",
    "maxLength": 50
  }'
```

### 3. Technical Analysis with Details

```bash
curl -X POST http://localhost:3000/api/caption-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://example.com/path/to/image.jpg",
    "style": "technical",
    "includeDetails": true,
    "maxLength": 100
  }'
```

## Caption Styles

- **`descriptive`** (default): Detailed visual descriptions of all elements
- **`concise`**: Brief descriptions highlighting key elements
- **`creative`**: Engaging, story-like descriptions
- **`technical`**: Focus on composition, lighting, and photographic elements

## Supported Image Formats

- JPEG
- PNG
- GIF
- WebP
- BMP

## Image Input Methods

### 1. Image URLs
Direct HTTP/HTTPS URLs to publicly accessible images:
```json
{
  "image": "https://example.com/image.jpg"
}
```

### 2. Base64 Encoded Images
Images encoded as base64 strings with proper MIME type prefix:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": ["image"],
        "message": "Required"
      }
    ]
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate image caption"
}
```

## Setup Requirements

### Required Environment Variables

1. **OpenAI API Key**: Set `OPENAI_API_KEY` in your environment variables
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Required for the vision model to function
   
2. **Access Token**: Set `DEFAULT_ACCESS_TOKEN` for production environments
   - Used for API authentication in production
   - Not required in development mode (`NODE_ENV=development`)

Create a `.env` file:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
DEFAULT_ACCESS_TOKEN=your-access-token-here
NODE_ENV=development
```

### Important Notes

- **The endpoint requires a valid OpenAI API key to function**
- Without a real API key, requests will return: `{"error": "Failed to generate image caption"}`
- Vision model usage incurs costs based on image size and complexity
- Ensure your OpenAI account has sufficient credits

## API Documentation

The endpoint is automatically documented in the OpenAPI specification available at:
- Swagger UI: `http://localhost:3000/api/ui`
- ReDoc: `http://localhost:3000/api/redoc`
- JSON Schema: `http://localhost:3000/api/doc`

## Rate Limits and Costs

- Uses OpenAI's GPT-4 Vision model
- Cost depends on image size and caption length
- Consider implementing rate limiting for production use

## Example Response

```json
{
  "caption": "A golden retriever dog sitting in a sunlit park with green grass and trees in the background. The dog appears happy with its tongue out, looking directly at the camera.",
  "style": "descriptive",
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 42,
    "total_tokens": 1292
  }
}
```