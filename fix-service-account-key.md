# Fix: Recreate Service Account Key Properly
# ==========================================

# Option 1: Use Google Cloud Console (Recommended)
# ================================================
# 1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=sunny-furnace-461114-s9
# 2. Find or create the "stackfast-github" service account
# 3. Click on the service account name
# 4. Go to the "Keys" tab
# 5. Click "Add Key" -> "Create new key" -> "JSON"
# 6. This will download a JSON file to your Downloads folder
# 7. Move/copy that file to this project directory
# 8. Rename it to "stackfast-key.json"

# Option 2: Fix the gcloud command
# ================================
# If you want to try gcloud again, run these commands step by step:

# Check if service account exists:
gcloud iam service-accounts list --project=sunny-furnace-461114-s9 --filter="email:stackfast-github*"

# If service account doesn't exist, create it:
gcloud iam service-accounts create stackfast-github --display-name="StackFast GitHub Actions" --project=sunny-furnace-461114-s9

# Grant permissions:
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 --member="serviceAccount:stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com" --role="roles/datastore.user"
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 --member="serviceAccount:stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com" --role="roles/firebase.admin"

# Create key with full path:
gcloud iam service-accounts keys create "C:\Users\MartinGfX\OneDrive\Documenten\StackFast powered by StackStudio\stackfast-key.json" --iam-account=stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com --project=sunny-furnace-461114-s9

# Then convert to base64 (once you have a valid JSON file):
$keyContent = Get-Content "stackfast-key.json" -Raw
$keyEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
Write-Host "Base64 key for GitHub:"
Write-Host $keyEncoded

# Copy the base64 output and update the GitHub secret:
# https://github.com/miasamura/StackFast-By-StackStudio-MVP-/settings/secrets/actions
