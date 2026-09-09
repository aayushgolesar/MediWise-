#!/bin/bash
set -e

echo "🔨 Building MediWise Backend for Render..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install --prefix backend

# Type check backend
echo "✅ Type checking backend..."
npm run lint --prefix backend

echo "✅ Build complete!"
