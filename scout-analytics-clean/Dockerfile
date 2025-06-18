# Scout Analytics Platform - Multi-stage Docker build

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S scout -u 1001

# Change ownership
RUN chown -R scout:nodejs /usr/share/nginx/html
RUN chown -R scout:nodejs /var/cache/nginx
RUN chown -R scout:nodejs /var/log/nginx
RUN chown -R scout:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER scout

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]