# StackFast Deployment Script
# This script helps prepare StackFast for production deployment

$ErrorActionPreference = "Stop"

Write-Host "🚀 StackFast Production Deployment Preparation" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify project structure
Write-Host "1️⃣ Verifying project structure..." -ForegroundColor Blue
$requiredFiles = @(
    "package.json",
    "next.config.js",
    ".env.example",
    "pages/index.tsx",
    "pages/api/auth/[...nextauth].ts",
    "pages/api/blueprints.ts",
    "pages/api/github/create-repo.ts",
    "lib/firebase-admin.js",
    "components/Auth.tsx",
    "components/StackFastApp.tsx"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
    exit 1
} else {
    Write-Host "✅ All required files present" -ForegroundColor Green
}

# Step 2: Check dependencies
Write-Host "2️⃣ Checking dependencies..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Step 3: Run type check
Write-Host "3️⃣ Running type check..." -ForegroundColor Blue
try {
    npm run type-check
    Write-Host "✅ Type check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}

# Step 4: Run linting
Write-Host "4️⃣ Running linting..." -ForegroundColor Blue
try {
    npm run lint
    Write-Host "✅ Linting passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Linting failed" -ForegroundColor Red
    exit 1
}

# Step 5: Test build
Write-Host "5️⃣ Testing build..." -ForegroundColor Blue
try {
    npm run build
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 6: Check environment configuration
Write-Host "6️⃣ Checking environment configuration..." -ForegroundColor Blue
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
    Write-Host "   Please create .env.local from .env.example" -ForegroundColor Yellow
}

# Step 7: Verify GitHub Actions workflow
Write-Host "7️⃣ Verifying GitHub Actions workflow..." -ForegroundColor Blue
if (Test-Path ".github/workflows/deploy.yml") {
    Write-Host "✅ GitHub Actions workflow exists" -ForegroundColor Green
} else {
    Write-Host "❌ GitHub Actions workflow not found" -ForegroundColor Red
    exit 1
}

# Step 8: Check WIF setup
Write-Host "8️⃣ Checking WIF setup..." -ForegroundColor Blue
if (Test-Path "setup-wif.ps1") {
    Write-Host "✅ WIF setup script exists" -ForegroundColor Green
} else {
    Write-Host "❌ WIF setup script not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 StackFast is ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run ./setup-wif.ps1 to configure Google Cloud authentication" -ForegroundColor White
Write-Host "2. Add the output secrets to your GitHub repository" -ForegroundColor White
Write-Host "3. Configure your deployment platform (Vercel/Firebase)" -ForegroundColor White
Write-Host "4. Push to main branch to trigger deployment" -ForegroundColor White
Write-Host ""
Write-Host "GitHub Secrets URL: https://github.com/miasamura/StackFast-By-StackStudio-MVP-/settings/secrets/actions" -ForegroundColor Blue
Write-Host "Deployment Guide: See DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Blue
Write-Host ""
Write-Host "🚀 Ready to launch!" -ForegroundColor Green
