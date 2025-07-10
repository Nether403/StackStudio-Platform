# Diagnostic Commands for GitHub Actions Issues
# ============================================

# Run these commands in a terminal where gcloud is available:

# 1. Check what service accounts exist in your project
gcloud iam service-accounts list --project=sunny-furnace-461114-s9

# 2. Check if the stackfast-github service account exists
gcloud iam service-accounts describe stackfast-github@sunny-furnace-461114-s9.iam.gserviceaccount.com --project=sunny-furnace-461114-s9

# 3. Check workload identity pool
gcloud iam workload-identity-pools describe github-pool --location=global --project=sunny-furnace-461114-s9

# 4. Check workload identity provider
gcloud iam workload-identity-pools providers describe github-provider --location=global --workload-identity-pool=github-pool --project=sunny-furnace-461114-s9

# Alternative: If stackfast-github service account doesn't exist, we can use the compute service account
# In that case, the GitHub secret should be:
# GCP_SERVICE_ACCOUNT_EMAIL: 243534787867-compute@developer.gserviceaccount.com

# Common issues and solutions:
# 1. Service account doesn't exist -> Create it or use existing compute service account
# 2. Workload identity pool doesn't exist -> Create it
# 3. Permissions not set correctly -> Grant proper roles
# 4. Repository binding not set -> Bind repository to workload identity
