# FRONTEND
FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# BACKEND
FROM node:20-alpine AS backend-builder
WORKDIR /build/backend

COPY backend/package*.json ./

# Install only production dependencies for a smaller footprint
RUN npm ci

# PRODUCTION
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache docker-cli bash

WORKDIR /app/web

COPY --from=backend-builder /build/backend/node_modules ./node_modules
COPY backend/package*.json ./

COPY backend/index.js ./
COPY backend/src ./src

COPY --from=frontend-builder /build/frontend/dist ./public

EXPOSE 8080

CMD ["node", "index.js"]
