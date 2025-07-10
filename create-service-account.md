# Quick Fix: Create Service Account and Use Key Authentication
# ===========================================================

# Step 1: Create the service account first
gcloud iam service-accounts create stackfast-github \
    --display-name="StackFast GitHub Actions" \
    --description="Service account for GitHub Actions to sync Firestore" \
    --project=sunny-furnace-461114-s9

# Step 2: Grant necessary permissions to the service account
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

# Step 3: Create a service account key
gcloud iam service-accounts keys create stackfast-key.json \
    --iam-account=stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com \
    --project=sunny-furnace-461114-s9

# Step 3.5: HOW TO VIEW THE JSON KEY FILE AFTER CREATION
# ======================================================

# After running Step 3, the stackfast-key.json file should be created in your current directory.
# Here's how to locate and view it:

# Option 1: Check if the file exists and where it is
Get-ChildItem -Name "stackfast-key.json"
# This will show the file if it exists in your current directory

# Option 2: View the JSON content (be careful - this contains sensitive data!)
Get-Content stackfast-key.json
# This displays the entire JSON file content in the terminal

# Option 3: View the JSON content with formatting
Get-Content stackfast-key.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
# This formats the JSON nicely for easier reading

# Option 4: Check the file size to make sure it's not empty
Get-ChildItem stackfast-key.json
# This shows file details including size - should be several KB, not 0 bytes

# Option 5: Open the file in notepad (Windows)
notepad stackfast-key.json
# This opens the JSON file in Notepad for viewing/editing

# IMPORTANT SECURITY NOTES:
# - The JSON file contains your private key and other sensitive credentials
# - Don't share this file or its contents publicly
# - Don't commit this file to Git (it should be in .gitignore)
# - After converting to base64 and adding to GitHub secrets, you can delete this local file

# TROUBLESHOOTING:
# If the file doesn't exist, check:
# 1. Did the gcloud command run without errors?
# 2. Are you in the correct directory?
# 3. Did you have proper permissions to create the service account?

# TROUBLESHOOTING: CAN'T FIND THE JSON KEY FILE
# ===============================================

# The key is created but you can't see/access the JSON file.
# Let's find where it actually went:

# Method 1: Search for the file on your entire system
Get-ChildItem -Path C:\ -Name "stackfast-key.json" -Recurse -ErrorAction SilentlyContinue
# This searches your entire C: drive for the file

# Method 2: Check your current working directory
pwd
Get-ChildItem *.json
# Shows where you are and lists all JSON files in current directory

# Method 3: Check common locations where gcloud might save files
Get-ChildItem -Path $env:USERPROFILE -Name "stackfast-key.json" -Recurse -ErrorAction SilentlyContinue
Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Name "*stackfast*" -ErrorAction SilentlyContinue
Get-ChildItem -Path "$env:USERPROFILE\Documents" -Name "*stackfast*" -ErrorAction SilentlyContinue

# Method 4: Alternative - Create key with full path
$keyPath = Join-Path $PWD "stackfast-key.json"
Write-Host "Creating key at: $keyPath"
# Then run the gcloud command with this specific path:
# gcloud iam service-accounts keys create "$keyPath" --iam-account=stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com

# Method 5: ALTERNATIVE APPROACH - Use Google Cloud Console instead
# If gcloud command isn't working, you can create the key manually:
# 1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=sunny-furnace-461114-s9
# 2. Find the "stackfast-github" service account (or create it if it doesn't exist)
# 3. Click on it, then go to "Keys" tab
# 4. Click "Add Key" > "Create new key" > "JSON"
# 5. This will download the JSON file to your Downloads folder

# Method 6: Check if the service account even exists
# Run this to verify the service account was created:
# gcloud iam service-accounts list --project=sunny-furnace-461114-s9 --filter="email:stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com"

# Step 4: Convert the key to base64 for GitHub secrets
# DETAILED EXPLANATION:
# 
# The stackfast-key.json file contains sensitive authentication credentials in JSON format.
# GitHub secrets require this to be encoded as a base64 string for security.
# 
# Here's what each command does:

# 4a. Read the entire JSON file content into a PowerShell variable
$keyContent = Get-Content stackfast-key.json -Raw
# - "Get-Content" reads the file
# - "-Raw" means read as one single string (not line by line)
# - This loads the entire JSON content into $keyContent variable

# 4b. Convert the JSON content to base64 encoding
$keyEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
# - [System.Text.Encoding]::UTF8.GetBytes() converts the string to bytes
# - [System.Convert]::ToBase64String() converts those bytes to base64 format
# - Base64 is a safe way to represent binary data as text
# - This creates a long string of letters, numbers, and symbols

# 4c. Display the base64 string so you can copy it
Write-Host "Copy this base64 key for GitHub secrets:"
Write-Host $keyEncoded

# IMPORTANT NOTES:
# - The base64 string will be VERY long (several hundred characters)
# - Copy the ENTIRE string - don't miss any characters
# - This string is sensitive - treat it like a password
# - You'll paste this entire base64 string into GitHub as the secret value

# EXAMPLE: 
# If your JSON file contains: {"type":"service_account","project_id":"my-project"...}
# The base64 output might look like: eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6Im15LXByb2plY3QiLi4ufQ==

# Step 5: Add the base64 key as a GitHub secret named GCP_SERVICE_ACCOUNT_KEY
# Go to: https://github.com/miasamura/StackFast-By-StackStudio-MVP-/settings/secrets/actions
# Create a new secret: GCP_SERVICE_ACCOUNT_KEY
# Paste the base64 string from Step 4

# Step 6: Enable Firestore API (if not already enabled)
gcloud services enable firestore.googleapis.com --project=sunny-furnace-461114-s9
