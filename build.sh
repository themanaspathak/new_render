#!/bin/bash
set -e

echo "Installing dependencies..."
npm install --include=dev

echo "Building frontend..."
npm run build

echo "Generating database migrations..."
npx drizzle-kit generate

echo "Build completed successfully!"