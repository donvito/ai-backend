# Environment Setup for AI Backend

## API Keys

To use the various AI endpoints, you need to set up API keys:

1. Create a `.env` file in the root directory of this project
2. Add the following lines to the file, replacing the placeholders with your actual API keys:
   ```
   OPENAI_API_KEY=your-openai-api-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Make sure to add `.env` to your `.gitignore` file to avoid committing sensitive information to version control

### Required API Keys:

- **OPENAI_API_KEY**: Required for `/summarize`, `/sentiment`, `/translate`, `/keywords`, `/tweet` endpoints and OpenAI Vision for `/api/analyze-image`
- **GEMINI_API_KEY**: Required for Gemini Vision support in `/api/analyze-image` endpoint

Note: For the `/api/analyze-image` endpoint, you need at least one of the API keys (OpenAI or Gemini). If both are provided, you can specify which provider to use, otherwise it will auto-select OpenAI if available.

## Running the Application

After setting up the environment variables, you can run the application using:

```
npm run dev
```

The summarize endpoint will be available at `/summarize` and will require an API key header (`x-api-key`) for access.

## Testing the Endpoints

### Testing the Summarize Endpoint

You can test the summarize endpoint with the following curl command:

```
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{"text": "Your long text to be summarized goes here.", "maxLength": 100}'
```

Replace `your-secret-api-key` with the same API key specified in `src/index.ts`.

### Testing the Image Analysis Endpoint

You can test the image analysis endpoint with the following curl command:

```bash
# Basic image analysis (both caption and object detection)
curl -X POST http://localhost:3000/api/analyze-image \
  -F "image=@path/to/your/image.jpg"

# Caption only with specific provider
curl -X POST http://localhost:3000/api/analyze-image \
  -F "image=@path/to/your/image.jpg" \
  -F "analysisType=caption" \
  -F "provider=openai"

# Object detection only with Gemini
curl -X POST http://localhost:3000/api/analyze-image \
  -F "image=@path/to/your/image.jpg" \
  -F "analysisType=objects" \
  -F "provider=gemini"
```

**Parameters:**
- `image` (required): Image file (JPEG, PNG, GIF, WebP, max 10MB)
- `analysisType` (optional): "caption", "objects", or "both" (default: "both")
- `provider` (optional): "openai" or "gemini" (auto-selects if not specified)
