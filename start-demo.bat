@echo off
cls
echo.
echo ========================================
echo  🎬 StackFast Demo Environment Setup
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo 📁 Project Directory: %CD%
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please make sure you're running this from the StackFast project root.
    pause
    exit /b 1
)

echo ✅ Project files found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

echo 🚀 Starting development server...
echo.
echo ⏳ Please wait for "ready" message, then press any key to open browser...
echo.

REM Start the dev server and wait for user input
start cmd /k "title StackFast Dev Server && npm run dev"

echo.
echo 🔗 Server should be starting at: http://localhost:3000
echo.
echo Press any key to open browser (wait for server to be ready first)...
pause >nul

echo 🌐 Opening browser...
start http://localhost:3000

echo.
echo ✅ Demo environment is ready!
echo.
echo 📋 Quick Demo Checklist:
echo   □ Use incognito/private browsing mode
echo   □ Set browser window to 1200x800 for best recording
echo   □ Close unnecessary browser tabs
echo   □ Turn off notifications
echo.
echo 🎥 Happy recording! 
echo.
pause
