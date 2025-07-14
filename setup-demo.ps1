# Demo Environment Setup Script for StackFast GIF Recording
# PowerShell version - Run this before recording your demo GIF

Write-Host "🎬 Setting up StackFast Demo Environment..." -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "📁 Project directory: $ScriptDir" -ForegroundColor Yellow

# Change to the project directory
Set-Location $ScriptDir

# Verify we're in the right place
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found in current directory" -ForegroundColor Red
    Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "💡 Please run this script from the StackFast project root" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ package.json found - we're in the right directory!" -ForegroundColor Green
Write-Host ""

# Start the development server
Write-Host "📡 Starting development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir'; npm run dev"

# Wait for server to be ready
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Open browser to the correct URL
Write-Host "🌐 Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Demo environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Recording Checklist:" -ForegroundColor Cyan
Write-Host "  [ ] Browser is in incognito/private mode"
Write-Host "  [ ] Window size is appropriate (1200x800 recommended)"
Write-Host "  [ ] No browser extensions or notifications"
Write-Host "  [ ] Recording tool is ready"
Write-Host ""
Write-Host "🎯 Demo Flow:" -ForegroundColor Cyan
Write-Host "  1. Show homepage (SSR working!)"
Write-Host "  2. Sign in with GitHub"
Write-Host "  3. Create new blueprint"
Write-Host "  4. Enter: 'AI-powered SaaS dashboard'"
Write-Host "  5. Select skill level: Intermediate"
Write-Host "  6. Choose tools: React, Firebase, Vercel"
Write-Host "  7. Generate blueprint (show AI magic!)"
Write-Host "  8. Create GitHub repository"
Write-Host "  9. Show success and final dashboard"
Write-Host ""
Write-Host "⏱️  Target Duration: 12-15 seconds" -ForegroundColor Yellow
Write-Host "📏 Resolution: 1000x700 or 1200x800" -ForegroundColor Yellow
Write-Host "🎞️  Frame Rate: 15 FPS" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎬 Ready to record! Good luck!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
