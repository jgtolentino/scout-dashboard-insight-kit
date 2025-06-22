# Multi-stage Dockerfile for Scout Analytics Platform

# Stage 1: Backend
FROM python:3.11-slim AS backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend .
EXPOSE 5000
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:5000", "--workers", "4"]

# Stage 2: Frontend Build
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production - Nginx with both frontend and backend proxy
FROM nginx:stable-alpine AS production
WORKDIR /app

# Install Python and dependencies for backend
RUN apk add --no-cache python3 py3-pip
COPY --from=backend /app/backend /app/backend
WORKDIR /app/backend
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Configure Nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Add startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]