FROM node:20-alpine

# Install Docker CLI and bash so your scripts can execute commands against the host's Minecraft container
RUN apk add --no-cache docker-cli bash

# Nest the app to preserve the relative path logic used in server.js
WORKDIR /app/web

# Copy package definition and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the Express backend and the public frontend directory
COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
