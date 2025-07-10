# StackFast GitHub Secrets Setup Script (PowerShell)
# Run this script in PowerShell with Google Cloud CLI installed

Write-Host "🚀 StackFast GitHub Secrets Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Step 1: Project Setup
Write-Host "📋 Step 1: Set your Google Cloud Project ID" -ForegroundColor Yellow
$PROJECT_ID = Read-Host "Enter your Google Cloud Project ID"

if ([string]::IsNullOrEmpty($PROJECT_ID)) {
    Write-Host "❌ Project ID cannot be empty. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Using project: $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Step 2: Set the project
Write-Host "📋 Step 2: Setting active project" -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Step 3: Enable APIs
Write-Host "📋 Step 3: Enabling required APIs" -ForegroundColor Yellow
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable firestore.googleapis.com
Write-Host "✅ APIs enabled" -ForegroundColor Green
Write-Host ""

# Step 4: Create service account
Write-Host "📋 Step 4: Creating service account" -ForegroundColor Yellow
gcloud iam service-accounts create stackfast-github --display-name="StackFast GitHub Actions" --description="Service account for GitHub Actions to sync Firestore"
Write-Host "✅ Service account created" -ForegroundColor Green
Write-Host ""

# Step 5: Get project number and service account email
Write-Host "📋 Step 5: Getting project details" -ForegroundColor Yellow
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)").Trim()
$SERVICE_ACCOUNT_EMAIL = "stackfast-github@$PROJECT_ID.iam.gserviceaccount.com"

# Debug: Check if variables are properly set
if ([string]::IsNullOrEmpty($PROJECT_NUMBER)) {
    Write-Host "❌ Warning: PROJECT_NUMBER is empty! This will cause issues with secrets." -ForegroundColor Red
    Write-Host "Please ensure you have the correct project ID and permissions." -ForegroundColor Red
} else {
    Write-Host "✅ Project Number: $PROJECT_NUMBER" -ForegroundColor Green
}

Write-Host "✅ Service Account: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 5b: Granting Firestore permissions" -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/datastore.user"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/firebase.admin"
Write-Host "✅ Permissions granted" -ForegroundColor Green
Write-Host ""

# Step 6: Create workload identity pool
Write-Host "📋 Step 6: Creating workload identity pool" -ForegroundColor Yellow
gcloud iam workload-identity-pools create "github-pool" --location="global" --display-name="GitHub Actions Pool"
Write-Host "✅ Workload identity pool created" -ForegroundColor Green
Write-Host ""

# Step 7: Create workload identity provider
Write-Host "📋 Step 7: Creating workload identity provider" -ForegroundColor Yellow
gcloud iam workload-identity-pools providers create-oidc "github-provider" --location="global" --workload-identity-pool="github-pool" --display-name="GitHub Provider" --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" --issuer-uri="https://token.actions.githubusercontent.com"
Write-Host "✅ Workload identity provider created" -ForegroundColor Green
Write-Host ""

# Step 8: Set up GitHub repository access
Write-Host "📋 Step 8: GitHub repository setup" -ForegroundColor Yellow
$GITHUB_REPO = "miasamura/StackFast-By-StackStudio-MVP-"
Write-Host "Using GitHub repository: $GITHUB_REPO"
Write-Host ""

gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/$GITHUB_REPO"
Write-Host "✅ GitHub repository access configured" -ForegroundColor Green
Write-Host ""

# Step 9: Display the required GitHub secrets
Write-Host "🔐 GITHUB SECRETS - Copy these values to your GitHub repository" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Validate that we have all required values
if ([string]::IsNullOrEmpty($PROJECT_NUMBER) -or [string]::IsNullOrEmpty($PROJECT_ID)) {
    Write-Host "❌ ERROR: Missing required project information!" -ForegroundColor Red
    Write-Host "   PROJECT_ID: '$PROJECT_ID'" -ForegroundColor Red
    Write-Host "   PROJECT_NUMBER: '$PROJECT_NUMBER'" -ForegroundColor Red
    Write-Host "   Please check your Google Cloud setup and try again." -ForegroundColor Red
    exit 1
}

Write-Host "🔑 Secret Name: GCP_WORKLOAD_IDENTITY_PROVIDER" -ForegroundColor Yellow
Write-Host "📝 Secret Value:" -ForegroundColor White
Write-Host "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 Secret Name: GCP_SERVICE_ACCOUNT_EMAIL" -ForegroundColor Yellow
Write-Host "📝 Secret Value:" -ForegroundColor White
Write-Host "$SERVICE_ACCOUNT_EMAIL" -ForegroundColor Green
Write-Host ""
Write-Host "📍 How to add these secrets to GitHub:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com/miasamura/StackFast-By-StackStudio-MVP-" -ForegroundColor White
Write-Host "2. Click Settings > Secrets and variables > Actions" -ForegroundColor White
Write-Host "3. Click 'New repository secret'" -ForegroundColor White
Write-Host "4. Add each secret with the exact name and value shown above" -ForegroundColor White
Write-Host ""
Write-Host "✅ Setup complete! Your GitHub Actions will now be able to sync to Firestore." -ForegroundColor Green

# Save the secrets to a file for reference
$secretsContent = @"
GitHub Secrets for StackFast Firestore Sync
==========================================

Secret Name: GCP_WORKLOAD_IDENTITY_PROVIDER
Secret Value: projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider

Secret Name: GCP_SERVICE_ACCOUNT_EMAIL  
Secret Value: $SERVICE_ACCOUNT_EMAIL

Project ID: $PROJECT_ID
Project Number: $PROJECT_NUMBER
Service Account: $SERVICE_ACCOUNT_EMAIL
GitHub Repository: $GITHUB_REPO

Setup completed on: $(Get-Date)
"@

$secretsContent | Out-File -FilePath "github-secrets-values.txt" -Encoding UTF8
Write-Host ""
Write-Host "💾 Secrets saved to 'github-secrets-values.txt' for your reference" -ForegroundColor Magenta
