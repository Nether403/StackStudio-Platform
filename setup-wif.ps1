# Workload Identity Federation Setup Script for StackFast (PowerShell)
# This script sets up keyless authentication for GitHub Actions

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ID = "sunny-furnace-461114-s9"
$POOL_ID = "github-actions-pool"
$PROVIDER_ID = "github-actions-provider"
$SERVICE_ACCOUNT_NAME = "stackfast-github-actions"
$SERVICE_ACCOUNT_EMAIL = "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
$GITHUB_REPO = "miasamura/StackFast-By-StackStudio-MVP-"
$LOCATION = "global"

Write-Host "🚀 Setting up Workload Identity Federation for StackFast" -ForegroundColor Green
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "Repository: $GITHUB_REPO" -ForegroundColor Yellow
Write-Host "Service Account: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor Yellow
Write-Host ""

# Step 1: Set the project
Write-Host "1️⃣ Setting project..." -ForegroundColor Blue
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
Write-Host "2️⃣ Enabling required APIs..." -ForegroundColor Blue
gcloud services enable iamcredentials.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable sts.googleapis.com
gcloud services enable firestore.googleapis.com

# Step 3: Create service account (if it doesn't exist)
Write-Host "3️⃣ Creating service account..." -ForegroundColor Blue
$accountExists = $false
try {
    gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --format="value(name)" 2>$null
    $accountExists = $true
} catch {
    $accountExists = $false
}

if (-not $accountExists) {
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME `
        --display-name="StackFast WIF Service Account" `
        --description="Service account for GitHub Actions using Workload Identity Federation"
    Write-Host "✅ Service account created" -ForegroundColor Green
} else {
    Write-Host "✅ Service account already exists" -ForegroundColor Green
}

# Step 4: Grant permissions to service account
Write-Host "4️⃣ Granting permissions to service account..." -ForegroundColor Blue
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" `
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" `
    --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" `
    --role="roles/serviceusage.serviceUsageConsumer"

Write-Host "✅ Permissions granted" -ForegroundColor Green

# Step 5: Create workload identity pool
Write-Host "5️⃣ Creating workload identity pool..." -ForegroundColor Blue
$poolExists = $false
try {
    gcloud iam workload-identity-pools describe $POOL_ID --location=$LOCATION --format="value(name)" 2>$null
    $poolExists = $true
} catch {
    $poolExists = $false
}

if (-not $poolExists) {
    gcloud iam workload-identity-pools create $POOL_ID `
        --location=$LOCATION `
        --display-name="GitHub Actions Pool" `
        --description="Workload identity pool for GitHub Actions"
    Write-Host "✅ Workload identity pool created" -ForegroundColor Green
} else {
    Write-Host "✅ Workload identity pool already exists" -ForegroundColor Green
}

# Step 6: Create workload identity provider
Write-Host "6️⃣ Creating workload identity provider..." -ForegroundColor Blue
$providerExists = $false
try {
    gcloud iam workload-identity-pools providers describe $PROVIDER_ID `
        --workload-identity-pool=$POOL_ID `
        --location=$LOCATION --format="value(name)" 2>$null
    $providerExists = $true
} catch {
    $providerExists = $false
}

if (-not $providerExists) {
    gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID `
        --workload-identity-pool=$POOL_ID `
        --location=$LOCATION `
        --issuer-uri="https://token.actions.githubusercontent.com" `
        --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner,attribute.ref=assertion.ref" `
        --attribute-condition="assertion.repository=='$GITHUB_REPO'" `
        --display-name="GitHub Actions Provider"
    Write-Host "✅ Workload identity provider created" -ForegroundColor Green
} else {
    Write-Host "✅ Workload identity provider already exists" -ForegroundColor Green
}

# Step 7: Allow GitHub Actions to impersonate the service account
Write-Host "7️⃣ Binding GitHub Actions to service account..." -ForegroundColor Blue
$projectNumber = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL `
    --role="roles/iam.workloadIdentityUser" `
    --member="principalSet://iam.googleapis.com/projects/$projectNumber/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/$GITHUB_REPO"

Write-Host "✅ GitHub Actions bound to service account" -ForegroundColor Green

# Step 8: Get the workload identity provider resource name
Write-Host "8️⃣ Getting workload identity provider resource name..." -ForegroundColor Blue
$WORKLOAD_IDENTITY_PROVIDER = gcloud iam workload-identity-pools providers describe $PROVIDER_ID `
    --workload-identity-pool=$POOL_ID `
    --location=$LOCATION `
    --format="value(name)"

Write-Host "✅ Workload identity provider resource name: $WORKLOAD_IDENTITY_PROVIDER" -ForegroundColor Green

# Step 9: Verify the setup
Write-Host "9️⃣ Verifying setup..." -ForegroundColor Blue
Write-Host "Workload Identity Pool:" -ForegroundColor Yellow
gcloud iam workload-identity-pools describe $POOL_ID --location=$LOCATION

Write-Host ""
Write-Host "Workload Identity Provider:" -ForegroundColor Yellow
gcloud iam workload-identity-pools providers describe $PROVIDER_ID `
    --workload-identity-pool=$POOL_ID `
    --location=$LOCATION

Write-Host ""
Write-Host "Service Account:" -ForegroundColor Yellow
gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL

Write-Host ""
Write-Host "🎉 Setup complete! Here are your GitHub secrets:" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "GitHub Secrets to Add:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Secret Name: GCP_WORKLOAD_IDENTITY_PROVIDER" -ForegroundColor Yellow
Write-Host "Secret Value: $WORKLOAD_IDENTITY_PROVIDER" -ForegroundColor White
Write-Host ""
Write-Host "Secret Name: GCP_SERVICE_ACCOUNT_EMAIL" -ForegroundColor Yellow
Write-Host "Secret Value: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor White
Write-Host ""
Write-Host "Secret Name: GCP_PROJECT_ID" -ForegroundColor Yellow
Write-Host "Secret Value: $PROJECT_ID" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Add the above secrets to your GitHub repository" -ForegroundColor White
Write-Host "2. Update your workflow to use the WIF authentication" -ForegroundColor White
Write-Host "3. Test the workflow" -ForegroundColor White
Write-Host ""
Write-Host "GitHub Secrets URL: https://github.com/$GITHUB_REPO/settings/secrets/actions" -ForegroundColor Blue
