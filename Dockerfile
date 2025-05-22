# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and config files
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist


# Set default environment variables
ENV NODE_ENV=production \
    PORT=3000

# Document required environment variables
ENV OPENAI_API_KEY="" \
    DEFAULT_ACCESS_TOKEN=""

# Add environment variable documentation
LABEL org.opencontainers.image.description="AI Backend Service Environment Variables: \n\
OPENAI_API_KEY: Your OpenAI API key (required) \n\
DEFAULT_ACCESS_TOKEN: Access token for API authentication (required) \n\
PORT: Port to run the server on (default: 3000) \n\
NODE_ENV: Environment mode (default: production)"

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 