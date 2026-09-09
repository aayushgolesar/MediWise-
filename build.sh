#!/bin/bash
set -e

echo "Installing backend dependencies..."
cd backend
npm install --include=dev
echo "Building backend..."
npm run build
echo "Build complete!"
