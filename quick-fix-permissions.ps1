# Quick Fix: Grant Firestore Permissions

## Run These Commands Now

```powershell
# Grant Firestore access permissions
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" projects add-iam-policy-binding sunny-furnace-461114-s9 --member="serviceAccount:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com" --role="roles/datastore.user"

# Grant Firebase admin access
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" projects add-iam-policy-binding sunny-furnace-461114-s9 --member="serviceAccount:stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com" --role="roles/firebase.admin"

# Test the permissions
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" firestore collections list --project=sunny-furnace-461114-s9
```

## After Running These Commands

Trigger the workflow:
```powershell
echo "Test: After granting Firestore permissions" >> Database/ai_models_and_apis.json
git add Database/ai_models_and_apis.json
git commit -m "Test: After granting Firestore permissions to service account"
git push origin master
```

## Expected Result
The workflow should now:
1. ✅ Authenticate successfully
2. ✅ Access Firestore database
3. ✅ Upload all database files
4. ✅ Complete successfully!
