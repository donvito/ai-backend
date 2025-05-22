# Open Source AI Backend

Making common AI use cases easily accessible and customizable. Skip the heavy lifting of understanding OpenAI or other providers.

## Architecture

Hono is used to create the API.
Zod is used to validate the request and response schemas.
OpenAI is used to generate the response.

The codebase follows a modular design pattern:

- **src/routes/**: Each route is a separate module
- **src/services/**: Shared services (e.g., OpenAI integration)  
- **src/utils/**: Shared utility functions
- **src/schemas/**: Shared Zod schemas

## Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key
- `DEFAULT_ACCESS_TOKEN`: Access token for API authentication

Optional:
- `PORT`: Port to run the server on (default: 3000)
- `NODE_ENV`: Environment mode (default: production)

## Docker Usage

Build the image:
```bash
docker build -t ai-backend .
```

Run with environment variables:
```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -e DEFAULT_ACCESS_TOKEN=your_token \
  ai-backend
```

Or using an env file:
```bash
docker run -p 3000:3000 --env-file .env ai-backend
```

## Available Endpoints

- **/summarize**: Summarize text

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
