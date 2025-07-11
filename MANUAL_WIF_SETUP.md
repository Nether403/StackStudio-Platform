# 🚀 Manual Workload Identity Federation Setup Guide

Since the automated script is having issues with the terminal pager, let's set up WIF manually. This will be just as effective!

## Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project: **sunny-furnace-461114-s9**

## Step 2: Enable Required APIs

Go to [APIs & Services](https://console.cloud.google.com/apis/library) and enable:
- ✅ IAM Service Account Credentials API
- ✅ Cloud Resource Manager API  
- ✅ Identity and Access Management (IAM) API
- ✅ Security Token Service API
- ✅ Cloud Firestore API

## Step 3: Create Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. **Service account name**: `stackfast-wif-service`
4. **Display name**: `StackFast WIF Service Account`
5. **Description**: `Service account for GitHub Actions using Workload Identity Federation`
6. Click "Create and Continue"
7. **Grant roles**:
   - Add `Datastore User` role
   - Add `Firebase Admin` role
   - Add `Service Usage Consumer` role
8. Click "Done"

## Step 4: Create Workload Identity Pool

1. Go to [IAM & Admin > Workload Identity Federation](https://console.cloud.google.com/iam-admin/workload-identity-pools)
2. Click "Create Pool"
3. **Pool name**: `github-actions-pool`
4. **Pool ID**: `github-actions-pool`
5. **Description**: `Workload identity pool for GitHub Actions`
6. Click "Continue"

## Step 5: Create Workload Identity Provider

1. After creating the pool, click "Add Provider"
2. **Provider type**: `OpenID Connect (OIDC)`
3. **Provider name**: `github-actions-provider`
4. **Provider ID**: `github-actions-provider`
5. **Issuer URL**: `https://token.actions.githubusercontent.com`
6. **Audiences**: `Default audience` (leave as is)
7. **Attribute mapping**:
   - `google.subject` → `assertion.sub`
   - `attribute.repository` → `assertion.repository`
   - `attribute.repository_owner` → `assertion.repository_owner`
   - `attribute.ref` → `assertion.ref`
8. **Attribute conditions**: `assertion.repository == "miasamura/StackFast-By-StackStudio-MVP-"`
9. Click "Save"

## Step 6: Connect Service Account to Pool

1. Still in the Workload Identity Federation page
2. Click on your `github-actions-pool`
3. Click "Grant Access"
4. **Service account**: Select `stackfast-wif-service@sunny-furnace-461114-s9.iam.gserviceaccount.com`
5. **Attribute name**: `attribute.repository`
6. **Attribute value**: `miasamura/StackFast-By-StackStudio-MVP-`
7. Click "Save"

## Step 7: Get the Provider Resource Name

1. Go back to [Workload Identity Federation](https://console.cloud.google.com/iam-admin/workload-identity-pools)
2. Click on `github-actions-pool`
3. Click on `github-actions-provider`
4. Copy the **Provider resource name** (it looks like: `projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider`)

## Step 8: Add GitHub Secrets

Go to your GitHub repository: [Settings > Secrets and variables > Actions](https://github.com/miasamura/StackFast-By-StackStudio-MVP-/settings/secrets/actions)

Add these secrets:

### Secret 1: GCP_WORKLOAD_IDENTITY_PROVIDER
**Value**: The provider resource name from Step 7 (starts with `projects/...`)

### Secret 2: GCP_SERVICE_ACCOUNT_EMAIL  
**Value**: `stackfast-wif-service@sunny-furnace-461114-s9.iam.gserviceaccount.com`

### Secret 3: GCP_PROJECT_ID
**Value**: `sunny-furnace-461114-s9`

## Step 9: Test the WIF Workflow

1. **First, let's rename the current workflow to keep it as backup**:
   ```powershell
   mv .github/workflows/upload-database.yml .github/workflows/upload-database.yml.backup
   ```

2. **Commit and push the new WIF workflow**:
   ```powershell
   git add .github/workflows/sync-firestore-wif.yml
   git add .github/workflows/upload-database.yml.backup
   git commit -m "Add Workload Identity Federation workflow"
   git push origin master
   ```

3. **Trigger the workflow**:
   ```powershell
   echo "Testing WIF authentication - $(Get-Date)" >> trigger.txt
   git add trigger.txt
   git commit -m "Test WIF workflow"
   git push origin master
   ```

4. **Monitor the workflow**: https://github.com/miasamura/StackFast-By-StackStudio-MVP-/actions

## Step 10: Verify Success

If the workflow succeeds, you'll see:
- ✅ Authentication successful (no service account key needed!)
- ✅ Firestore sync completed
- ✅ All data uploaded successfully

## What to Do If It Fails

If the workflow fails, check:
1. **WIF Provider resource name** is correct in GitHub secrets
2. **Service account email** is correct
3. **Repository condition** matches exactly: `miasamura/StackFast-By-StackStudio-MVP-`
4. **Service account has the right permissions** (Datastore User, Firebase Admin)

## Benefits You'll Get

Once this works:
- 🔐 **No more service account keys** to manage
- 🔄 **Automatic credential rotation** by Google
- 🛡️ **Higher security** - no keys can be leaked
- 📊 **Better audit trail** and monitoring
- 🚀 **Future-proof** authentication

## Cleanup After Success

Once WIF is working:
1. Remove the old workflow backup
2. Delete the old GitHub secret `GCP_SERVICE_ACCOUNT_KEY`
3. Delete the `stackfast-key.json` file (if it exists)
4. Delete the old service account `stackfast-service@stackfast-407512.iam.gserviceaccount.com`

This gives you the modern, keyless authentication that Google recommends! 🎉
