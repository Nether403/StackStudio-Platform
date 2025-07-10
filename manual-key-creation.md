# Manual Service Account Key Creation Guide

The gcloud CLI seems to be having issues creating the service account key. Let's create it manually through the Google Cloud Console.

## Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Make sure you're in the correct project: `stackfast-d0b9c`

## Step 2: Navigate to Service Accounts
1. In the left sidebar, go to "IAM & Admin" > "Service Accounts"
2. Or use this direct link: https://console.cloud.google.com/iam-admin/serviceaccounts?project=stackfast-d0b9c

## Step 3: Find Your Service Account
Look for: `stackfast-sync@stackfast-d0b9c.iam.gserviceaccount.com`

## Step 4: Create New Key
1. Click on the service account name
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"

## Step 5: Download and Process the Key
1. The key will be downloaded as a JSON file
2. Save it as `stackfast-key.json` in your project directory
3. Run the PowerShell command below to encode it:

```powershell
# Read the key file
$keyContent = Get-Content "stackfast-key.json" -Raw

# Encode to base64
$keyBytes = [System.Text.Encoding]::UTF8.GetBytes($keyContent)
$keyEncoded = [System.Convert]::ToBase64String($keyBytes)

# Display the encoded key
Write-Host "Base64 encoded key:"
Write-Host $keyEncoded

# Save to file
$keyEncoded | Out-File "stackfast-key-base64.txt" -Encoding utf8
```

## Step 6: Update GitHub Secret
1. Go to: https://github.com/miasamura/StackFast-By-StackStudio-MVP-/settings/secrets/actions
2. Click on "GCP_SERVICE_ACCOUNT_KEY"
3. Click "Update secret"
4. Paste the base64 encoded string from step 5
5. Click "Update secret"

## Step 7: Test the Workflow
1. Make a small change to any file in the Database/ directory
2. Commit and push the change
3. Check GitHub Actions to see if the workflow runs successfully

## Troubleshooting
- Make sure the JSON file is valid (you can test with `Get-Content stackfast-key.json | ConvertFrom-Json`)
- Ensure there are no extra spaces or newlines when copying the base64 string
- The encoded string should be one long line without line breaks

## Alternative: Use the existing key
If you have trouble creating a new key, you can use the existing one:
`sunny-furnace-461114-s9-a89cf9d884ae.json`

Just rename it to `stackfast-key.json` and follow steps 5-7 above.
