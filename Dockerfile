FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Generate database migrations
RUN npx drizzle-kit generate

# Remove dev dependencies after build
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "start"]