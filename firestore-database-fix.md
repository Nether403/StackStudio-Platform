# Fix Firestore Database Creation Issue

## Problem Identified ✅
**Error Code 5 (NOT_FOUND)**: The Firestore database doesn't exist in the Google Cloud project `sunny-furnace-461114-s9`.

## Solution Applied
1. **Updated Workflow**: Added automatic Firestore database creation
2. **Enhanced Error Handling**: Better error messages for common issues
3. **API Enablement**: Automatically enables required Google Cloud APIs

## Service Account Permissions Needed
The service account needs these roles to create and manage Firestore:

```bash
# Grant the service account additional permissions
gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/datastore.owner"

gcloud projects add-iam-policy-binding sunny-furnace-461114-s9 \
    --member="serviceAccount:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com" \
    --role="roles/serviceusage.serviceUsageAdmin"
```

## Alternative: Manual Firestore Setup
If the automatic creation doesn't work, you can manually create the Firestore database:

1. Go to: https://console.cloud.google.com/firestore?project=sunny-furnace-461114-s9
2. Click "Create Database"
3. Select "Firestore in Native mode"
4. Choose a location (e.g., us-central1)
5. Click "Create Database"

## Workflow Changes
The workflow now:
1. ✅ Authenticates with Google Cloud
2. ✅ Enables required APIs (Firestore, Cloud Build)
3. ✅ Creates Firestore database if it doesn't exist
4. ✅ Installs Firebase Admin SDK
5. ✅ Syncs database files to Firestore

## Next Steps
1. The workflow should now automatically handle the database creation
2. If it still fails, run the gcloud commands above to grant additional permissions
3. Or manually create the Firestore database in the Google Cloud Console
