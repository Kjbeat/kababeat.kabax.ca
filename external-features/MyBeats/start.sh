#!/bin/bash

echo "🚀 Starting KabaBeat My-Beats Module Development Environment..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating environment file..."
    cp env.example .env.local
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎵 Starting development server..."
echo "🌐 The app will open at http://localhost:8083 (or next available port)"
echo "🔑 Use the Dev User Switcher in the top-right to test different users"
echo ""

# Start the development server
npm run dev:mongo
