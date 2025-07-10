# Fix Service Account Key for GitHub Actions
# This script will help you create a valid service account key

Write-Host "=== Fixing Service Account Key ===" -ForegroundColor Green
Write-Host ""

# Set the gcloud path
$gcloudPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

# Check if gcloud exists
if (!(Test-Path $gcloudPath)) {
    Write-Host "ERROR: gcloud not found at $gcloudPath" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Setting Google Cloud project..." -ForegroundColor Yellow
& $gcloudPath config set project stackfast-d0b9c

Write-Host "Step 2: Checking authentication..." -ForegroundColor Yellow
& $gcloudPath auth list

Write-Host "Step 3: Creating service account key..." -ForegroundColor Yellow
# Remove existing key if it exists
if (Test-Path "stackfast-key.json") {
    Remove-Item "stackfast-key.json" -Force
    Write-Host "Removed existing key file" -ForegroundColor Yellow
}

# Create new key
& $gcloudPath iam service-accounts keys create "stackfast-key.json" --iam-account="stackfast-sync@stackfast-d0b9c.iam.gserviceaccount.com"

# Check if key was created successfully
if (Test-Path "stackfast-key.json") {
    $keySize = (Get-Item "stackfast-key.json").Length
    if ($keySize -gt 0) {
        Write-Host "SUCCESS: Service account key created ($keySize bytes)" -ForegroundColor Green
        
        # Read and encode the key
        $keyContent = Get-Content "stackfast-key.json" -Raw
        $keyBytes = [System.Text.Encoding]::UTF8.GetBytes($keyContent)
        $keyEncoded = [System.Convert]::ToBase64String($keyBytes)
        
        Write-Host ""
        Write-Host "=== Base64 Encoded Key for GitHub ===" -ForegroundColor Green
        Write-Host $keyEncoded
        Write-Host ""
        Write-Host "Copy the above base64 string and update your GitHub secret 'GCP_SERVICE_ACCOUNT_KEY'" -ForegroundColor Yellow
        
        # Also save to file for reference
        $keyEncoded | Out-File "stackfast-key-base64.txt" -Encoding utf8
        Write-Host "Base64 key also saved to: stackfast-key-base64.txt" -ForegroundColor Yellow
        
    } else {
        Write-Host "ERROR: Key file is empty" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: Key file was not created" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Copy the base64 string above"
Write-Host "2. Go to GitHub -> Settings -> Secrets and variables -> Actions"
Write-Host "3. Edit the 'GCP_SERVICE_ACCOUNT_KEY' secret"
Write-Host "4. Paste the new base64 string"
Write-Host "5. Save the secret"
Write-Host "6. Trigger the workflow again"
