#!/bin/bash

# Setup script for media processing dependencies
echo "Setting up media processing dependencies..."

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg not found. Installing..."
    
    # Detect OS and install FFmpeg
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ffmpeg
        else
            echo "Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        echo "Please install FFmpeg manually from https://ffmpeg.org/download.html"
        exit 1
    else
        echo "Unsupported OS. Please install FFmpeg manually."
        exit 1
    fi
else
    echo "FFmpeg is already installed."
fi

# Check if FFprobe is installed
if ! command -v ffprobe &> /dev/null; then
    echo "FFprobe not found. It should be included with FFmpeg."
    exit 1
else
    echo "FFprobe is available."
fi

# Create temp directory
mkdir -p temp
echo "Created temp directory for media processing."

# Set permissions
chmod 755 temp

echo "Media processing setup complete!"
echo ""
echo "FFmpeg version:"
ffmpeg -version | head -n 1
echo ""
echo "FFprobe version:"
ffprobe -version | head -n 1
