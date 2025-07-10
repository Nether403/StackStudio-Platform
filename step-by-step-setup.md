# Step-by-Step Workload Identity Setup
# ====================================

# Run these commands ONE BY ONE and share the output:

# Step 1: Set project
gcloud config set project sunny-furnace-461114-s9

# Step 2: Check if workload identity pool exists
gcloud iam workload-identity-pools describe github-pool --location=global --project=sunny-furnace-461114-s9

# If Step 2 shows "NOT_FOUND", then run Step 3:
# Step 3: Create workload identity pool
gcloud iam workload-identity-pools create "github-pool" --location="global" --display-name="GitHub Actions Pool" --project=sunny-furnace-461114-s9

# Step 4: Check if workload identity provider exists
gcloud iam workload-identity-pools providers describe github-provider --location=global --workload-identity-pool=github-pool --project=sunny-furnace-461114-s9

# If Step 4 shows "NOT_FOUND", then run Step 5:
# Step 5: Create workload identity provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" --location="global" --workload-identity-pool="github-pool" --display-name="GitHub Provider" --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" --issuer-uri="https://token.actions.githubusercontent.com" --project=sunny-furnace-461114-s9

# ALTERNATIVE APPROACH: If the above fails, we can use service account keys instead
# This is less secure but easier to set up:

# Alternative Step 1: Create service account key
gcloud iam service-accounts keys create stackfast-key.json --iam-account=stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com

# Alternative Step 2: Encode the key for GitHub secrets
# On Windows PowerShell:
# $keyContent = Get-Content stackfast-key.json -Raw
# $keyEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
# echo $keyEncoded

# Then add this as a GitHub secret named GCP_SERVICE_ACCOUNT_KEY
# And update the workflow to use the key instead of workload identity
