#!/bin/bash

echo "🚀 Starting Kababeat Upload Module Development Environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ .env.local created with default values"
else
    echo "✅ .env.local already exists"
fi

# Start development server
echo "🌐 Starting development server..."
echo "📍 Open http://localhost:5173 in your browser"
echo "🔑 Use Dev User Switcher (bottom-right) to test authentication"
echo ""
echo "🎯 Ready to build amazing upload features!"
npm run dev:mongo
