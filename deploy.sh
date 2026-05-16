#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "================================================="
echo "🚀 Starting DanYar AI Production Deployment..."
echo "================================================="

# 1. Pull the latest code from the repository
echo "[1/3] 📦 Pulling latest changes from GitHub..."
git pull origin main

# 2. Build and restart the specific services with the production environment file
echo "[2/3] 🏗️ Rebuilding and starting Next.js Panel and Bale Bot..."
# Updated container names to match docker-compose.prod.yml
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build bale_ai_panel bale_ai_bot

# 3. Clean up dangling (unused) Docker images to free up disk space
echo "[3/3] 🧹 Cleaning up old Docker images..."
docker image prune -f

echo "================================================="
echo "✅ Deployment completed successfully!"
echo "🌐 Panel and Bot are now running the latest version."
echo "================================================="