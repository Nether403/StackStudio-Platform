# GitHub Secrets Setup Guide for StackFast Firestore Sync

This guide explains how to set up the required GitHub secrets for automatic Firestore synchronization.

## Required Secrets

Your GitHub repository needs these two secrets to authenticate with Google Cloud:

1. **`GCP_WORKLOAD_IDENTITY_PROVIDER`** - The workload identity provider resource name
2. **`GCP_SERVICE_ACCOUNT_EMAIL`** - The service account email address

## Step-by-Step Setup

### 1. Enable Required Google Cloud APIs

In your Google Cloud Console, enable these APIs:
- Cloud Resource Manager API
- Identity and Access Management (IAM) API
- Firestore API

### 2. Create a Service Account

```bash
# Set your project ID
PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create stackfast-github \
    --display-name="StackFast GitHub Actions" \
    --description="Service account for GitHub Actions to sync Firestore"

# Get the service account email
SERVICE_ACCOUNT_EMAIL="stackfast-github@${PROJECT_ID}.iam.gserviceaccount.com"
```

### 3. Grant Firestore Permissions

```bash
# Grant Firestore admin permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/datastore.user"

# Grant Cloud Firestore Service Agent role (for full database access)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/firebase.admin"
```

### 4. Create Workload Identity Pool

```bash
# Create workload identity pool
gcloud iam workload-identity-pools create "github-pool" \
    --location="global" \
    --display-name="GitHub Actions Pool"

# Get the pool ID
POOL_ID="github-pool"
```

### 5. Create Workload Identity Provider

```bash
# Create the provider for GitHub
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --location="global" \
    --workload-identity-pool="$POOL_ID" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

### 6. Allow GitHub to Impersonate Service Account

```bash
# Replace with your GitHub username and repository name
GITHUB_REPO="miasamura/StackFast-By-StackStudio-MVP-"

# Allow GitHub Actions to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
    "${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${GITHUB_REPO}"
```

### 7. Get Required Values

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Workload Identity Provider (this is the value for GCP_WORKLOAD_IDENTITY_PROVIDER)
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/github-provider"

# Service Account Email (this is the value for GCP_SERVICE_ACCOUNT_EMAIL)
echo "${SERVICE_ACCOUNT_EMAIL}"
```

### 8. Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add these two secrets:

**Secret Name:** `GCP_WORKLOAD_IDENTITY_PROVIDER`
**Secret Value:** `projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider`

**Secret Name:** `GCP_SERVICE_ACCOUNT_EMAIL`
**Secret Value:** `stackfast-github@YOUR_PROJECT_ID.iam.gserviceaccount.com`

## Testing the Setup

### Manual Test (Local)

```bash
# Install dependencies
npm install firebase-admin

# Test the sync script locally (requires service account key)
node Scripts/sync-firestore.js
```

### GitHub Actions Test

1. Make a change to any JSON file in the `Database/` directory
2. Commit and push to the master/main branch
3. Check the **Actions** tab in your GitHub repository
4. The "Sync Firestore Data" workflow should run automatically

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Verify service account has correct Firestore permissions
   - Check that workload identity is properly configured

2. **"Workload identity provider not found"**
   - Verify the provider resource name is correct
   - Ensure the provider was created in the same project

3. **"Invalid audience" errors**
   - Check that the GitHub repository name matches exactly
   - Verify the attribute mapping includes the repository

### Debug Commands

```bash
# Test workload identity configuration
gcloud iam workload-identity-pools providers describe github-provider \
    --location="global" \
    --workload-identity-pool="github-pool"

# List service account IAM policies
gcloud iam service-accounts get-iam-policy "${SERVICE_ACCOUNT_EMAIL}"
```

## Security Notes

- **Never commit service account keys** to your repository
- Use workload identity federation instead of service account keys
- Regularly review and rotate service account permissions
- Monitor Firestore usage and access logs

## Firestore Structure

After successful sync, your Firestore database will contain these collections:

- `ai_models_and_apis` - AI/ML tools and APIs
- `authentication_services` - Auth providers
- `backend_frameworks` - Server-side frameworks
- `cloud_platforms` - Cloud providers (AWS, GCP, Azure)
- `coding_tools` - Development tools
- `css_frameworks` - Styling frameworks
- `databases` - Database solutions
- `deployment_platforms` - Hosting platforms
- `frontend_frameworks` - Client-side frameworks
- `monitoring_analytics` - Analytics and monitoring tools

Each collection contains documents with the structure defined in your JSON files, using the `id` field as the document ID.
