# Use Node.js 20
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm

# Declare build arguments
ARG NEXT_PUBLIC_TOKEN_FOR_FULLSIZE_FILE
ARG NEXT_PUBLIC_TOKEN_FOR_CHAT_MESSAGE
ARG NEXT_PUBLIC_MAX_FILE_SIZE
ARG NEXT_PUBLIC_BACKEND_DOMAIN
ARG NEXT_PUBLIC_STAGE
ARG NEXT_PUBLIC_WS_URL
# Add any other env vars your app needs

# Set them as environment variables for the build
ENV NEXT_PUBLIC_TOKEN_FOR_FULLSIZE_FILE=$NEXT_PUBLIC_TOKEN_FOR_FULLSIZE_FILE
ENV NEXT_PUBLIC_TOKEN_FOR_CHAT_MESSAGE=$NEXT_PUBLIC_TOKEN_FOR_CHAT_MESSAGE
ENV NEXT_PUBLIC_MAX_FILE_SIZE=$NEXT_PUBLIC_MAX_FILE_SIZE
ENV NEXT_PUBLIC_BACKEND_DOMAIN=$NEXT_PUBLIC_BACKEND_DOMAIN
ENV NEXT_PUBLIC_STAGE=$NEXT_PUBLIC_STAGE
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app (now has access to env vars)
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NEXT_PUBLIC_NODE_ENV=production

# Security: Non-root User
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOST="0.0.0.0"
# ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]