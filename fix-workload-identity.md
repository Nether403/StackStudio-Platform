# Fix GitHub Actions Authentication - Missing Workload Identity Setup
# ===================================================================

# Run these commands in a terminal where gcloud is available:

# 1. Set the project (replace with your project ID)
gcloud config set project sunny-furnace-461114-s9

# 2. Enable required APIs (if not already enabled)
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable iamcredentials.googleapis.com
gcloud services enable sts.googleapis.com

# 3. Create workload identity pool
gcloud iam workload-identity-pools create "github-pool" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --description="Workload identity pool for GitHub Actions"

# 4. Create workload identity provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"

# 5. Create service account (if it doesn't exist)
gcloud iam service-accounts create stackfast-github \
    --display-name="StackFast GitHub Actions" \
    --description="Service account for GitHub Actions to sync Firestore"

# 6. Grant permissions to the service account
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

# 7. Bind GitHub repository to workload identity
gcloud iam service-accounts add-iam-policy-binding \
    "stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/243534787867/locations/global/workloadIdentityPools/github-pool/attribute.repository/miasamura/StackFast-By-StackStudio-MVP-"

# 8. Verify the setup
echo "Verifying workload identity pool:"
gcloud iam workload-identity-pools describe github-pool --location=global

echo "Verifying workload identity provider:"
gcloud iam workload-identity-pools providers describe github-provider --location=global --workload-identity-pool=github-pool

echo "Verifying service account:"
gcloud iam service-accounts describe stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com

# After running these commands, your GitHub secrets should be:
# GCP_WORKLOAD_IDENTITY_PROVIDER: projects/243534787867/locations/global/workloadIdentityPools/github-pool/providers/github-provider
# GCP_SERVICE_ACCOUNT_EMAIL: stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com
