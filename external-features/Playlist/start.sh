#!/bin/bash

echo "🎵 Starting Kababeat Playlists Development Environment"
echo "=================================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating environment file..."
    cp env.example .env.local
    echo "✅ Environment file created. Edit .env.local if needed."
fi

echo "🚀 Starting development server..."
echo "📱 Open http://localhost:5173 in your browser"
echo "🔧 Use the Dev User Switcher (bottom-right) to test different users"
echo ""

npm run dev:mongo
