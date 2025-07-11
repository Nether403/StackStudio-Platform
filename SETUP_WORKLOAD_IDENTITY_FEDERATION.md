# 🚀 Implementing Workload Identity Federation (WIF) - The Modern Way

You're absolutely right! Workload Identity Federation is the superior, keyless approach that Google recommends. Let's implement it properly.

## Why WIF is Better

✅ **Keyless**: No long-lived credentials to manage or rotate  
✅ **More Secure**: No risk of key leakage  
✅ **Future-Proof**: Google's recommended approach  
✅ **Automatic**: No manual key management  
✅ **Audit-Friendly**: Better tracking and monitoring  

## What Went Wrong Before

Looking at the previous attempt, I can see the setup was partially done but likely had issues with:
1. **Repository URL formatting** - The GitHub repository name binding
2. **Project ID consistency** - Multiple project IDs were used
3. **Missing verification** - Setup wasn't properly verified
4. **Incomplete testing** - The workflow might not have been tested with the correct configuration

## Current Project Information

Based on your working setup:
- **Project ID**: `stackfast-407512`
- **Repository**: `miasamura/StackFast-By-StackStudio-MVP-`
- **Service Account**: `stackfast-service@stackfast-407512.iam.gserviceaccount.com`

## Step-by-Step WIF Implementation

### Step 1: Create the WIF Setup Script

I'll create a comprehensive script that sets up everything correctly:

```bash
#!/bin/bash

# Variables
PROJECT_ID="stackfast-407512"
REPO_NAME="miasamura/StackFast-By-StackStudio-MVP-"
SERVICE_ACCOUNT_NAME="stackfast-service"
LOCATION="global"

# Enable APIs
gcloud services enable \
  iam.googleapis.com \
  cloudbuild.googleapis.com \
  container.googleapis.com \
  --project=$PROJECT_ID

# Create a workload identity pool
gcloud iam workload-identity-pools create "github-actions-pool" \
  --project=$PROJECT_ID --location=$LOCATION --display-name="GitHub Actions Pool"

# Create a workload identity provider
gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
  --project=$PROJECT_ID --location=$LOCATION \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Create a service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --project=$PROJECT_ID --display-name="StackFast WIF Service Account"

# Grant roles to the service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

# Create a keyless credential configuration
gcloud iam workload-identity-pools providers add-attribute-binding \
  "github-actions-provider" --workload-identity-pool="github-actions-pool" \
  --location=$LOCATION --attribute="repository" \
  --value="miasamura/StackFast-By-StackStudio-MVP-"

# Output
echo "WIF setup completed!"
echo "Service Account Email: $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "Workload Identity Provider: projects/$PROJECT_ID/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"
```

### Step 2: Run the Setup Script

I've created both bash and PowerShell versions of the setup script. Choose the one that works for your environment:

**Option A: PowerShell (Windows)**
```powershell
.\setup-wif.ps1
```

**Option B: Bash (Linux/Mac/WSL)**
```bash
chmod +x setup-wif.sh
./setup-wif.sh
```

### Step 3: Add GitHub Secrets

After running the script, you'll get the secret values. Add these to your GitHub repository:

1. Go to: https://github.com/miasamura/StackFast-By-StackStudio-MVP-/settings/secrets/actions
2. Add these secrets:
   - `GCP_WORKLOAD_IDENTITY_PROVIDER` - The workload identity provider resource name
   - `GCP_SERVICE_ACCOUNT_EMAIL` - The service account email
   - `GCP_PROJECT_ID` - Your Google Cloud project ID

### Step 4: Update Your Workflow

I've created a new workflow file: `.github/workflows/sync-firestore-wif.yml`

This workflow:
- Uses keyless authentication (no service account keys!)
- Has proper permissions for WIF (`id-token: write`)
- Authenticates using the `google-github-actions/auth@v2` action
- Uses your WIF provider and service account

### Step 5: Test the New Workflow

1. **Disable the old workflow** (rename it to add `.disabled` extension):
   ```powershell
   mv .github/workflows/upload-database.yml .github/workflows/upload-database.yml.disabled
   ```

2. **Trigger the new workflow**:
   ```powershell
   echo "Testing WIF authentication - $(Get-Date)" >> trigger.txt
   git add trigger.txt
   git add .github/workflows/sync-firestore-wif.yml
   git commit -m "Add Workload Identity Federation authentication"
   git push origin master
   ```

3. **Monitor the workflow** at: https://github.com/miasamura/StackFast-By-StackStudio-MVP-/actions

## Why This Setup is Superior

### 🔐 Security Benefits
- **No Long-Lived Secrets**: No service account keys to manage or rotate
- **Reduced Attack Surface**: Keys can't be leaked or stolen
- **Automated Rotation**: Google handles credential rotation automatically
- **Audit Trail**: Better logging and monitoring of authentication

### 🚀 Operational Benefits
- **Zero Maintenance**: No key rotation needed
- **Scalability**: Easy to add more repositories or environments
- **Consistency**: Same pattern across all Google Cloud services
- **Future-Proof**: Aligned with Google's security best practices

### 📊 What Happens Behind the Scenes

1. **GitHub Actions** generates an OIDC token
2. **Google Cloud** validates the token against your WIF provider
3. **WIF Provider** checks the repository and conditions
4. **Service Account** is temporarily impersonated
5. **Firestore Operations** are performed with the service account's permissions

## Troubleshooting

### Common Issues and Solutions

**1. Authentication Failed**
```
Error: Failed to get access token from the metadata server
```
- Check that the WIF provider is correctly configured
- Verify the GitHub repository name matches exactly
- Ensure the service account has the correct permissions

**2. Permission Denied**
```
Error: The caller does not have permission
```
- Verify the service account has `roles/datastore.user` and `roles/firebase.admin`
- Check that the WIF binding is correct for your repository

**3. Workflow Not Triggered**
```
No workflow runs appear
```
- Ensure the workflow file is in the correct location
- Check that the trigger paths match your file changes
- Verify the workflow has the correct permissions

### Debug Commands

To debug your WIF setup:

```bash
# Check workload identity pool
gcloud iam workload-identity-pools describe github-actions-pool --location=global

# Check workload identity provider  
gcloud iam workload-identity-pools providers describe github-actions-provider \
  --workload-identity-pool=github-actions-pool --location=global

# Check service account
gcloud iam service-accounts describe stackfast-wif-service@stackfast-407512.iam.gserviceaccount.com

# Check IAM bindings
gcloud projects get-iam-policy stackfast-407512 \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:stackfast-wif-service@stackfast-407512.iam.gserviceaccount.com"
```

## Migration Timeline

1. **Phase 1**: Set up WIF alongside existing key-based auth ✅
2. **Phase 2**: Test WIF workflow thoroughly
3. **Phase 3**: Switch to WIF as primary method
4. **Phase 4**: Remove service account keys and old workflow
5. **Phase 5**: Monitor and optimize

## Next Steps

1. **Run the setup script** to create the WIF configuration
2. **Add the GitHub secrets** with the values from the script
3. **Test the new workflow** by triggering it with a change
4. **Monitor for success** and troubleshoot any issues
5. **Once confirmed working**, disable the old key-based workflow

This modern approach will make your authentication more secure, easier to manage, and aligned with Google's best practices!

## References

- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC Integration](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
