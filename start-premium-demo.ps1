# StackFast Premium Demo Startup - PowerShell
# Starts the demo with all premium visual enhancements

Write-Host "🚀 Starting StackFast Premium Demo..." -ForegroundColor Cyan
Write-Host "✨ Features: Custom logos, neon effects, premium backgrounds" -ForegroundColor Magenta
Write-Host ""

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start development server
Write-Host "🎨 Starting premium demo server..." -ForegroundColor Green
Write-Host "🌐 Visit: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "🎬 Perfect for demo recording!" -ForegroundColor Yellow
Write-Host "📱 Responsive design with neon effects" -ForegroundColor Magenta
Write-Host "⚡ Features custom StackFast branding" -ForegroundColor Cyan
Write-Host ""

# Set environment for demo
$env:NODE_OPTIONS = "--no-warnings"
npm run dev
