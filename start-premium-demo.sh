#!/bin/bash
# Premium Demo Startup Script - Linux/macOS
# Starts the StackFast demo with premium visual enhancements

echo "🚀 Starting StackFast Premium Demo..."
echo "✨ Features: Custom logos, neon effects, premium backgrounds"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server with relaxed linting
echo "🎨 Starting premium demo server..."
echo "🌐 Visit: http://localhost:3000"
echo ""
echo "🎬 Perfect for demo recording!"
echo "📱 Responsive design with neon effects"
echo "⚡ Features custom StackFast branding"
echo ""

# Start with reduced TypeScript checking for demo
NODE_OPTIONS="--no-warnings" npm run dev -- --turbo
