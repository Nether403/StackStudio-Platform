@echo off
REM Premium Demo Startup Script - Windows
REM Starts the StackFast demo with premium visual enhancements

echo 🚀 Starting StackFast Premium Demo...
echo ✨ Features: Custom logos, neon effects, premium backgrounds
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Start development server with relaxed linting
echo 🎨 Starting premium demo server...
echo 🌐 Visit: http://localhost:3000
echo.
echo 🎬 Perfect for demo recording!
echo 📱 Responsive design with neon effects
echo ⚡ Features custom StackFast branding
echo.

REM Start with reduced warnings for demo
set NODE_OPTIONS=--no-warnings
call npm run dev
