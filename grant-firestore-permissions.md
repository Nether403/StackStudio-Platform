# Grant Firestore Permissions to Service Account

## Problem: Service Account Lacks Firestore Access Rights

The service account `stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com` needs specific permissions to access Firestore.

## Solution: Grant Required Permissions

Run these commands to grant the necessary permissions:

```bash
# Grant Firestore access permissions
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

# Additional permission for full Firestore access
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

# Alternative: Cloud Firestore Service Agent
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

## Quick Test Commands

```bash
# Test Firestore access
gcloud firestore collections list --project=sunny-furnace-461114-s9

# List current permissions
gcloud projects get-iam-policy sunny-furnace-461114-s9 \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com"
```

## Alternative: Use Different Service Account

If the above doesn't work, we can try using the default Compute Engine service account:

```bash
# Find the default service account
gcloud iam service-accounts list --project=sunny-furnace-461114-s9

# Grant permissions to the default service account
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:ACCOUNT_ID@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/datastore.user"
```

## Expected Permissions Needed

The service account should have these roles:
- `roles/datastore.user` - Basic Firestore read/write access
- `roles/firebase.admin` - Full Firebase admin access (includes Firestore)
- `roles/serviceusage.serviceUsageConsumer` - To use Google Cloud services

## After Granting Permissions

Trigger the workflow again:
```bash
echo "Test: After granting Firestore permissions" >> Database/ai_models_and_apis.json
git add Database/ai_models_and_apis.json
git commit -m "Test: After granting Firestore permissions to service account"
git push origin master
```
