#!/bin/bash
# Demo Environment Setup Script for StackFast GIF Recording
# Run this before recording your demo GIF

echo "🎬 Setting up StackFast Demo Environment..."

# Start the development server
echo "📡 Starting development server..."
npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 5

# Open browser to the correct URL
echo "🌐 Opening browser..."
start http://localhost:3000

echo "✅ Demo environment ready!"
echo ""
echo "📋 Recording Checklist:"
echo "  [ ] Browser is in incognito/private mode"
echo "  [ ] Window size is appropriate (1200x800 recommended)"
echo "  [ ] No browser extensions or notifications"
echo "  [ ] Recording tool is ready"
echo ""
echo "🎯 Demo Flow:"
echo "  1. Show homepage (SSR working!)"
echo "  2. Sign in with GitHub"
echo "  3. Create new blueprint"
echo "  4. Enter: 'AI-powered SaaS dashboard'"
echo "  5. Select skill level: Intermediate"
echo "  6. Choose tools: React, Firebase, Vercel"
echo "  7. Generate blueprint (show AI magic!)"
echo "  8. Create GitHub repository"
echo "  9. Show success and final dashboard"
echo ""
echo "⏱️  Target Duration: 12-15 seconds"
echo "📏 Resolution: 1000x700 or 1200x800"
echo "🎞️  Frame Rate: 15 FPS"
echo ""
echo "🎬 Ready to record! Good luck!"

# Keep the server running
wait $DEV_PID
