@echo off
REM Demo Environment Setup Script for StackFast GIF Recording
REM Run this before recording your demo GIF

echo 🎬 Setting up StackFast Demo Environment...
echo.

REM Get the current directory where this script is located
set SCRIPT_DIR=%~dp0
echo 📁 Project directory: %SCRIPT_DIR%

REM Change to the project directory
cd /d "%SCRIPT_DIR%"

REM Verify we're in the right place
if not exist "package.json" (
    echo ❌ Error: package.json not found in current directory
    echo 📁 Current directory: %CD%
    echo 💡 Please run this script from the StackFast project root
    pause
    exit /b 1
)

REM Start the development server
echo 📡 Starting development server...
start "StackFast Dev Server" cmd /k "cd /d "%SCRIPT_DIR%" && npm run dev"

REM Wait for server to be ready
echo ⏳ Waiting for server to start...
timeout /t 10 /nobreak >nul

REM Open browser to the correct URL
echo 🌐 Opening browser...
start http://localhost:3000

echo ✅ Demo environment ready!
echo.
echo 📋 Recording Checklist:
echo   [ ] Browser is in incognito/private mode
echo   [ ] Window size is appropriate (1200x800 recommended)
echo   [ ] No browser extensions or notifications
echo   [ ] Recording tool is ready
echo.
echo 🎯 Demo Flow:
echo   1. Show homepage (SSR working!)
echo   2. Sign in with GitHub
echo   3. Create new blueprint
echo   4. Enter: 'AI-powered SaaS dashboard'
echo   5. Select skill level: Intermediate
echo   6. Choose tools: React, Firebase, Vercel
echo   7. Generate blueprint (show AI magic!)
echo   8. Create GitHub repository
echo   9. Show success and final dashboard
echo.
echo ⏱️  Target Duration: 12-15 seconds
echo 📏 Resolution: 1000x700 or 1200x800
echo 🎞️  Frame Rate: 15 FPS
echo.
echo 🎬 Ready to record! Good luck!
echo.
pause
