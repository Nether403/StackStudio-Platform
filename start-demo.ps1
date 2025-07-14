# StackFast Demo Environment Setup (PowerShell)
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🎬 StackFast Demo Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

Write-Host "📁 Project Directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Stop any existing Node.js processes
Write-Host "🛑 Stopping any existing Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Existing processes stopped" -ForegroundColor Green
} catch {
    Write-Host "✅ No existing processes to stop" -ForegroundColor Green
}
Write-Host ""

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please make sure you're running this from the StackFast project root." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Project files found" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Server will start in a new window. Wait for 'ready' message..." -ForegroundColor Yellow
Write-Host ""

# Start the dev server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { Set-Location '$PWD'; Write-Host 'StackFast Development Server' -ForegroundColor Cyan; npm run dev }"

Write-Host ""
Write-Host "🔗 Server will be available at: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to open browser (wait for server to be ready first)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Demo environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Demo Checklist:" -ForegroundColor Cyan
Write-Host "  □ Use incognito/private browsing mode" -ForegroundColor White
Write-Host "  □ Set browser window to 1200x800 for best recording" -ForegroundColor White
Write-Host "  □ Close unnecessary browser tabs" -ForegroundColor White
Write-Host "  □ Turn off notifications" -ForegroundColor White
Write-Host ""
Write-Host "🎥 Happy recording!" -ForegroundColor Magenta
Write-Host ""
Read-Host "Press Enter to exit"
