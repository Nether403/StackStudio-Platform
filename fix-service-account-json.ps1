# Fix Service Account Key for GitHub Actions
# This script helps regenerate and properly encode the service account key

Write-Host "=== Fixing Service Account Key Issue ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "The error 'unterminated string in JSON at position 823' indicates" -ForegroundColor Red
Write-Host "that the service account key JSON is malformed or corrupted." -ForegroundColor Red
Write-Host ""

Write-Host "Step 1: Regenerate Service Account Key" -ForegroundColor Green
Write-Host "Run this command in a terminal where gcloud is available:" -ForegroundColor Cyan
Write-Host ""
Write-Host "gcloud iam service-accounts keys create stackfast-key.json --iam-account=stackfast-sync@stackfast-d0b9c.iam.gserviceaccount.com" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Verify the JSON file is valid" -ForegroundColor Green
Write-Host "Check that the file contains valid JSON with these commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Check if file exists and has content" -ForegroundColor Gray
Write-Host "Get-Content stackfast-key.json | Select-Object -First 5" -ForegroundColor White
Write-Host ""
Write-Host "# Test JSON validity" -ForegroundColor Gray
Write-Host "try { Get-Content stackfast-key.json | ConvertFrom-Json; Write-Host 'JSON is valid' -ForegroundColor Green } catch { Write-Host 'JSON is invalid' -ForegroundColor Red }" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Properly encode for GitHub" -ForegroundColor Green
Write-Host "Use this command to base64 encode the key:" -ForegroundColor Cyan
Write-Host ""
Write-Host "`$keyContent = Get-Content stackfast-key.json -Raw" -ForegroundColor White
Write-Host "`$base64Key = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(`$keyContent))" -ForegroundColor White
Write-Host "Write-Host `$base64Key" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Alternative - Use raw JSON (recommended)" -ForegroundColor Green
Write-Host "Instead of base64 encoding, you can use the raw JSON directly:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copy the ENTIRE content of stackfast-key.json" -ForegroundColor White
Write-Host "2. Go to GitHub Settings > Secrets and variables > Actions" -ForegroundColor White
Write-Host "3. Edit the GCP_SERVICE_ACCOUNT_KEY secret" -ForegroundColor White
Write-Host "4. Paste the RAW JSON content (not base64 encoded)" -ForegroundColor White
Write-Host ""

Write-Host "Step 5: Test the fix" -ForegroundColor Green
Write-Host "After updating the secret, trigger the workflow:" -ForegroundColor Cyan
Write-Host ""
Write-Host "echo 'Fixed service account key' >> Database/ai_models_and_apis.json" -ForegroundColor White
Write-Host "git add Database/ai_models_and_apis.json" -ForegroundColor White
Write-Host "git commit -m 'Test: Fixed service account key JSON formatting'" -ForegroundColor White
Write-Host "git push origin master" -ForegroundColor White
Write-Host ""

Write-Host "=== Current Status ===" -ForegroundColor Yellow
if (Test-Path "stackfast-key.json") {
    $keySize = (Get-Item "stackfast-key.json").Length
    if ($keySize -eq 0) {
        Write-Host "❌ Service account key file exists but is EMPTY" -ForegroundColor Red
        Write-Host "   You need to regenerate it with the gcloud command above" -ForegroundColor Red
    } else {
        Write-Host "✅ Service account key file exists and has content ($keySize bytes)" -ForegroundColor Green
        try {
            $keyContent = Get-Content "stackfast-key.json" -Raw
            $keyJson = $keyContent | ConvertFrom-Json
            Write-Host "✅ JSON is valid" -ForegroundColor Green
            Write-Host "   Project ID: $($keyJson.project_id)" -ForegroundColor White
            Write-Host "   Client Email: $($keyJson.client_email)" -ForegroundColor White
        } catch {
            Write-Host "❌ JSON is invalid or corrupted" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Service account key file does not exist" -ForegroundColor Red
    Write-Host "   You need to create it with the gcloud command above" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Quick Fix Commands ===" -ForegroundColor Yellow
Write-Host "If you have gcloud installed, run these commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Regenerate key" -ForegroundColor Gray
Write-Host "gcloud iam service-accounts keys create stackfast-key.json --iam-account=stackfast-sync@stackfast-d0b9c.iam.gserviceaccount.com" -ForegroundColor White
Write-Host ""
Write-Host "# Get raw JSON content" -ForegroundColor Gray
Write-Host "Get-Content stackfast-key.json -Raw | Set-Clipboard" -ForegroundColor White
Write-Host "# This copies the raw JSON to clipboard - paste it directly into GitHub secret" -ForegroundColor Gray
Write-Host ""
