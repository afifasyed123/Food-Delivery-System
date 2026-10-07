# Backend Dockerfile for Food Delivery API
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Expose HTTP and WebSocket port
EXPOSE 5000

ENV PORT=5000 \
    NODE_ENV=production

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/health || exit 1

CMD ["node", "src/server.js"]
