#!/bin/bash

# KabaBeats Frontend Environment Setup Script
echo "🚀 Setting up KabaBeats Frontend Environment..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Keeping existing .env.local file."
        exit 1
    fi
fi

# Copy template to .env.local
echo "📋 Copying environment template..."
cp env.example .env.local

# Make .env.local file readable only by owner
chmod 600 .env.local

echo "✅ Environment file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local file with your actual credentials:"
echo "   - Google OAuth Client ID"
echo "   - Backend API URL (if different from default)"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "🔒 Security reminder:"
echo "- Never commit .env.local files to version control"
echo "- Keep your secrets secure"
echo "- Use different credentials for each environment"
echo ""
echo "📚 For more information, see docs/GOOGLE_OAUTH_SETUP.md"
