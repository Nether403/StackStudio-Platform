# Verify Service Account Key Script
# ==================================

# Check if key file exists and is not empty
$keyFile = "stackfast-key.json"
Write-Host "Checking service account key file..." -ForegroundColor Yellow

if (Test-Path $keyFile) {
    $size = (Get-Item $keyFile).Length
    if ($size -gt 0) {
        Write-Host "✓ Key file exists and is not empty ($size bytes)" -ForegroundColor Green
        
        # Try to parse as JSON
        try {
            $json = Get-Content $keyFile -Raw | ConvertFrom-Json
            Write-Host "✓ Key file is valid JSON" -ForegroundColor Green
            Write-Host "  Project ID: $($json.project_id)" -ForegroundColor Cyan
            Write-Host "  Client Email: $($json.client_email)" -ForegroundColor Cyan
            Write-Host "  Key ID: $($json.private_key_id)" -ForegroundColor Cyan
            Write-Host "  Type: $($json.type)" -ForegroundColor Cyan
            
            # Check if it has the required fields
            $requiredFields = @('type', 'project_id', 'private_key_id', 'private_key', 'client_email')
            $allFieldsPresent = $true
            foreach ($field in $requiredFields) {
                if (-not $json.$field) {
                    Write-Host "✗ Missing required field: $field" -ForegroundColor Red
                    $allFieldsPresent = $false
                }
            }
            
            if ($allFieldsPresent) {
                Write-Host "✓ All required fields are present" -ForegroundColor Green
                
                # Offer to base64 encode the key
                Write-Host "`nWould you like to base64 encode this key for GitHub? (y/n)" -ForegroundColor Yellow
                $response = Read-Host
                if ($response -eq 'y' -or $response -eq 'Y') {
                    $keyContent = Get-Content $keyFile -Raw
                    $keyEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
                    Write-Host "`nBase64 encoded key (copy this to GitHub secret):" -ForegroundColor Green
                    Write-Host $keyEncoded -ForegroundColor White
                    
                    # Save to file for convenience
                    $keyEncoded | Out-File -FilePath "stackfast-key-base64.txt" -Encoding utf8
                    Write-Host "`nBase64 key also saved to: stackfast-key-base64.txt" -ForegroundColor Cyan
                }
            }
            
        } catch {
            Write-Host "✗ Key file is not valid JSON: $_" -ForegroundColor Red
            Write-Host "File content preview:" -ForegroundColor Yellow
            Get-Content $keyFile -TotalCount 5
        }
    } else {
        Write-Host "✗ Key file is empty" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Key file does not exist" -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. If the key file is missing or empty, follow the manual creation guide in 'manual-service-account-key-creation.md'" -ForegroundColor White
Write-Host "2. Once you have a valid key, update the GitHub secret GCP_SERVICE_ACCOUNT_KEY with the base64 encoded version" -ForegroundColor White
Write-Host "3. Test the workflow by editing trigger.txt and pushing to GitHub" -ForegroundColor White
