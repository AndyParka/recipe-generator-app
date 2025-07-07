#!/bin/bash

# Recipe App Deployment Script
echo "🍽️  Recipe App Deployment Script"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🔨 Building Docker image..."
docker-compose build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🚀 Starting Recipe App..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ Recipe App is now running!"
        echo "🌐 Open your browser and go to: http://localhost:8080"
        echo ""
        echo "📋 Useful commands:"
        echo "  - View logs: docker-compose logs -f"
        echo "  - Stop app: docker-compose down"
        echo "  - Restart app: docker-compose restart"
        echo "  - Update app: docker-compose up -d --build"
    else
        echo "❌ Failed to start the app. Check the logs above."
        exit 1
    fi
else
    echo "❌ Build failed. Check the logs above."
    exit 1
fi 