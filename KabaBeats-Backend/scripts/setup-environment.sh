#!/bin/bash

# KabaBeats Backend Environment Setup Script
echo "🚀 Setting up KabaBeats Backend Environment..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Keeping existing .env file."
        exit 1
    fi
fi

# Copy template to .env
echo "📋 Copying environment template..."
cp env.template .env

# Make .env file readable only by owner
chmod 600 .env

echo "✅ Environment file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your actual credentials:"
echo "   - MongoDB Atlas connection string"
echo "   - Cloudflare R2 credentials"
echo "   - Google OAuth credentials"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "🔒 Security reminder:"
echo "- Never commit .env files to version control"
echo "- Keep your secrets secure"
echo "- Use different secrets for each environment"
echo ""
echo "📚 For more information, see docs/SECURITY_SETUP.md"
