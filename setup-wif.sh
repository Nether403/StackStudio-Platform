#!/bin/bash
# Workload Identity Federation Setup Script for StackFast
# This script sets up keyless authentication for GitHub Actions

set -e

# Configuration
PROJECT_ID="stackfast-407512"
POOL_ID="github-actions-pool"
PROVIDER_ID="github-actions-provider"
SERVICE_ACCOUNT_NAME="stackfast-wif-service"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
GITHUB_REPO="miasamura/StackFast-By-StackStudio-MVP-"
LOCATION="global"

echo "🚀 Setting up Workload Identity Federation for StackFast"
echo "Project ID: $PROJECT_ID"
echo "Repository: $GITHUB_REPO"
echo "Service Account: $SERVICE_ACCOUNT_EMAIL"
echo ""

# Step 1: Set the project
echo "1️⃣ Setting project..."
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo "2️⃣ Enabling required APIs..."
gcloud services enable iamcredentials.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable sts.googleapis.com
gcloud services enable firestore.googleapis.com

# Step 3: Create service account (if it doesn't exist)
echo "3️⃣ Creating service account..."
if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL >/dev/null 2>&1; then
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="StackFast WIF Service Account" \
        --description="Service account for GitHub Actions using Workload Identity Federation"
    echo "✅ Service account created"
else
    echo "✅ Service account already exists"
fi

# Step 4: Grant permissions to service account
echo "4️⃣ Granting permissions to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/serviceusage.serviceUsageConsumer"

echo "✅ Permissions granted"

# Step 5: Create workload identity pool
echo "5️⃣ Creating workload identity pool..."
if ! gcloud iam workload-identity-pools describe $POOL_ID --location=$LOCATION >/dev/null 2>&1; then
    gcloud iam workload-identity-pools create $POOL_ID \
        --location=$LOCATION \
        --display-name="GitHub Actions Pool" \
        --description="Workload identity pool for GitHub Actions"
    echo "✅ Workload identity pool created"
else
    echo "✅ Workload identity pool already exists"
fi

# Step 6: Create workload identity provider
echo "6️⃣ Creating workload identity provider..."
if ! gcloud iam workload-identity-pools providers describe $PROVIDER_ID \
    --workload-identity-pool=$POOL_ID \
    --location=$LOCATION >/dev/null 2>&1; then
    
    gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID \
        --workload-identity-pool=$POOL_ID \
        --location=$LOCATION \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner,attribute.ref=assertion.ref" \
        --attribute-condition="assertion.repository=='$GITHUB_REPO'" \
        --display-name="GitHub Actions Provider"
    echo "✅ Workload identity provider created"
else
    echo "✅ Workload identity provider already exists"
fi

# Step 7: Allow GitHub Actions to impersonate the service account
echo "7️⃣ Binding GitHub Actions to service account..."
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/$GITHUB_REPO"

echo "✅ GitHub Actions bound to service account"

# Step 8: Get the workload identity provider resource name
echo "8️⃣ Getting workload identity provider resource name..."
WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe $PROVIDER_ID \
    --workload-identity-pool=$POOL_ID \
    --location=$LOCATION \
    --format="value(name)")

echo "✅ Workload identity provider resource name: $WORKLOAD_IDENTITY_PROVIDER"

# Step 9: Verify the setup
echo "9️⃣ Verifying setup..."
echo "Workload Identity Pool:"
gcloud iam workload-identity-pools describe $POOL_ID --location=$LOCATION

echo ""
echo "Workload Identity Provider:"
gcloud iam workload-identity-pools providers describe $PROVIDER_ID \
    --workload-identity-pool=$POOL_ID \
    --location=$LOCATION

echo ""
echo "Service Account:"
gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL

echo ""
echo "🎉 Setup complete! Here are your GitHub secrets:"
echo ""
echo "================================"
echo "GitHub Secrets to Add:"
echo "================================"
echo "Secret Name: GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "Secret Value: $WORKLOAD_IDENTITY_PROVIDER"
echo ""
echo "Secret Name: GCP_SERVICE_ACCOUNT_EMAIL"
echo "Secret Value: $SERVICE_ACCOUNT_EMAIL"
echo ""
echo "Secret Name: GCP_PROJECT_ID"  
echo "Secret Value: $PROJECT_ID"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. Add the above secrets to your GitHub repository"
echo "2. Update your workflow to use the WIF authentication"
echo "3. Test the workflow"
echo ""
echo "GitHub Secrets URL: https://github.com/$GITHUB_REPO/settings/secrets/actions"
