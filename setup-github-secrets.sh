#!/bin/bash
# StackFast GitHub Secrets Setup Script
# Run this script in your local terminal with Google Cloud CLI installed

echo "🚀 StackFast GitHub Secrets Setup"
echo "=================================="
echo ""

# Step 1: Project Setup
echo "📋 Step 1: Set your Google Cloud Project ID"
echo "Replace 'your-stackfast-project-id' with your actual project ID:"
echo ""
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty. Exiting."
    exit 1
fi

echo "✅ Using project: $PROJECT_ID"
echo ""

# Step 2: Set the project
echo "📋 Step 2: Setting active project"
gcloud config set project $PROJECT_ID

# Step 3: Enable APIs
echo "📋 Step 3: Enabling required APIs"
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable firestore.googleapis.com
echo "✅ APIs enabled"
echo ""

# Step 4: Create service account
echo "📋 Step 4: Creating service account"
gcloud iam service-accounts create stackfast-github \
    --display-name="StackFast GitHub Actions" \
    --description="Service account for GitHub Actions to sync Firestore"
echo "✅ Service account created"
echo ""

# Step 5: Get project number and service account email
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT_EMAIL="stackfast-github@${PROJECT_ID}.iam.gserviceaccount.com"

echo "📋 Step 5: Granting Firestore permissions"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/firebase.admin"
echo "✅ Permissions granted"
echo ""

# Step 6: Create workload identity pool
echo "📋 Step 6: Creating workload identity pool"
gcloud iam workload-identity-pools create "github-pool" \
    --location="global" \
    --display-name="GitHub Actions Pool"
echo "✅ Workload identity pool created"
echo ""

# Step 7: Create workload identity provider
echo "📋 Step 7: Creating workload identity provider"
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"
echo "✅ Workload identity provider created"
echo ""

# Step 8: Set up GitHub repository access
echo "📋 Step 8: GitHub repository setup"
GITHUB_REPO="miasamura/StackFast-By-StackStudio-MVP-"
echo "Using GitHub repository: $GITHUB_REPO"
echo ""

gcloud iam service-accounts add-iam-policy-binding \
    "${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_REPO}"
echo "✅ GitHub repository access configured"
echo ""

# Step 9: Display the required GitHub secrets
echo "🔐 GITHUB SECRETS - Copy these values to your GitHub repository"
echo "================================================================"
echo ""
echo "🔑 Secret Name: GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "📝 Secret Value:"
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
echo ""
echo "🔑 Secret Name: GCP_SERVICE_ACCOUNT_EMAIL"
echo "📝 Secret Value:"
echo "${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "📍 How to add these secrets to GitHub:"
echo "1. Go to https://github.com/miasamura/StackFast-By-StackStudio-MVP-"
echo "2. Click Settings > Secrets and variables > Actions"
echo "3. Click 'New repository secret'"
echo "4. Add each secret with the exact name and value shown above"
echo ""
echo "✅ Setup complete! Your GitHub Actions will now be able to sync to Firestore."
