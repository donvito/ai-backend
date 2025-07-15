# Open Source AI Backend

Making common AI use cases easily accessible and customizable. Skip the heavy lifting of understanding OpenAI or other providers.

![AI Backend Architecture Diagram](images/ai-backend-diagram.png)


## Architecture

Hono is used to create the API.
Zod is used to validate the request and response schemas.
OpenAI is used to generate the response.

The codebase follows a modular design pattern:

- **src/routes/**: Each route is a separate module
- **src/services/**: Shared services (e.g., OpenAI integration)  
- **src/utils/**: Shared utility functions
- **src/schemas/**: Shared Zod schemas

## Available Endpoints

- **/summarize**: Summarize long text using AI
- **/translate**: Translate text between languages  
- **/keywords**: Extract keywords from text
- **/sentiment**: Analyze sentiment of text
- **/tweet**: Generate tweets about topics
- **/caption-image**: Generate natural language captions for images using Vision AI

## Current Models Supported

- OpenAI using the official OpenAI typescript SDK

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build
```

## API Documentation

API documentation is available at `/api/ui` when the server is running.
