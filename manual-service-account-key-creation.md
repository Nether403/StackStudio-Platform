# Manual Service Account Key Creation Guide
# ==========================================

## The Problem
The `stackfast-key.json` file is empty and needs to be recreated with a valid service account key.

## Solution: Create Key Through Google Cloud Console

### Step 1: Open Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project (stackfast-407512)

### Step 2: Navigate to Service Accounts
1. In the left sidebar, click on "IAM & Admin"
2. Click on "Service Accounts"
3. Look for the service account: `stackfast-service@stackfast-407512.iam.gserviceaccount.com`

### Step 3: Create a New Key
1. Click on the service account name
2. Click on the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create"
6. The key will be automatically downloaded to your Downloads folder

### Step 4: Move and Rename the Key
1. Find the downloaded file in your Downloads folder (it will have a long name like `stackfast-407512-abc123def456.json`)
2. Copy it to your project directory: `c:\Users\MartinGfX\OneDrive\Documenten\StackFast powered by StackStudio\`
3. Rename it to `stackfast-key.json`

### Step 5: Verify the Key
Run this command to check if the key is valid:
```powershell
Get-Content stackfast-key.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

The output should show a JSON object with fields like:
- `type`: "service_account"
- `project_id`: "stackfast-407512"
- `private_key_id`: (some ID)
- `private_key`: (long key starting with -----BEGIN PRIVATE KEY-----)
- `client_email`: "stackfast-service@stackfast-407512.iam.gserviceaccount.com"
- etc.

### Step 6: Base64 Encode the Key
Once you have the valid key file, run:
```powershell
$keyContent = Get-Content stackfast-key.json -Raw
$keyEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
Write-Host $keyEncoded
```

### Step 7: Update GitHub Secret
1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Find the `GCP_SERVICE_ACCOUNT_KEY` secret
4. Click "Update"
5. Paste the base64-encoded key from Step 6
6. Click "Update secret"

### Step 8: Test the Workflow
1. Edit the `trigger.txt` file to trigger the workflow:
```powershell
echo "Manual key creation test - $(Get-Date)" >> trigger.txt
git add trigger.txt
git commit -m "Test workflow with new service account key"
git push origin master
```

## Alternative: Command Line Method
If you prefer using command line and can get gcloud working:

```powershell
# Make sure you're authenticated and in the right project
gcloud auth login
gcloud config set project stackfast-407512

# Create the key
gcloud iam service-accounts keys create stackfast-key.json --iam-account=stackfast-service@stackfast-407512.iam.gserviceaccount.com

# If the service account doesn't exist, create it:
gcloud iam service-accounts create stackfast-service --display-name="StackFast Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding stackfast-407512 --member="serviceAccount:stackfast-service@stackfast-407512.iam.gserviceaccount.com" --role="roles/datastore.user"
gcloud projects add-iam-policy-binding stackfast-407512 --member="serviceAccount:stackfast-service@stackfast-407512.iam.gserviceaccount.com" --role="roles/firebase.admin"
```

## Troubleshooting
- If the service account doesn't exist, you'll need to create it first
- Make sure your Google Cloud project has the Firestore API enabled
- Verify that the service account has the necessary permissions
- Check that the GitHub secret is updated with the correct base64-encoded key

## Quick Verification Script
Save this as `verify-key.ps1` and run it to verify everything is working:

```powershell
# Check if key file exists and is not empty
$keyFile = "stackfast-key.json"
if (Test-Path $keyFile) {
    $size = (Get-Item $keyFile).Length
    if ($size -gt 0) {
        Write-Host "✓ Key file exists and is not empty ($size bytes)"
        
        # Try to parse as JSON
        try {
            $json = Get-Content $keyFile | ConvertFrom-Json
            Write-Host "✓ Key file is valid JSON"
            Write-Host "  Project ID: $($json.project_id)"
            Write-Host "  Client Email: $($json.client_email)"
            Write-Host "  Key ID: $($json.private_key_id)"
        } catch {
            Write-Host "✗ Key file is not valid JSON: $_"
        }
    } else {
        Write-Host "✗ Key file is empty"
    }
} else {
    Write-Host "✗ Key file does not exist"
}
```
