FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Run database migrations
RUN npx drizzle-kit generate

EXPOSE 5000

CMD ["npm", "start"]