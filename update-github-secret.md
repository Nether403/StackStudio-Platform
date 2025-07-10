# Update GitHub Secret with Working Service Account Key

## Current Status
✅ Found working service account key: `sunny-furnace-461114-s9-a89cf9d884ae.json`
✅ Service account: `stackfast-github-actions@sunny-furnace-461114-s9.iam.gserviceaccount.com`
✅ Project: `sunny-furnace-461114-s9`
✅ Base64 encoded key generated: `working-key-base64.txt`

## Next Steps

### 1. Copy the Base64 Key
The base64 encoded key is in the file `working-key-base64.txt`. Copy the entire content.

### 2. Update GitHub Secret
1. Go to: https://github.com/miasamura/StackFast-By-StackStudio-MVP-/settings/secrets/actions
2. Click on "GCP_SERVICE_ACCOUNT_KEY"
3. Click "Update secret"
4. Delete the old content and paste the new base64 string
5. Click "Update secret"

### 3. Workflow Updated
The workflow has been updated to use the correct project ID: `sunny-furnace-461114-s9`

### 4. Test the Workflow
After updating the secret, commit and push any change to trigger the workflow:

```powershell
# Make a small change to trigger the workflow
echo "Test: $(Get-Date)" >> Database/ai_models_and_apis.json
git add Database/ai_models_and_apis.json
git commit -m "Test: Updated service account key"
git push origin master
```

## Files Updated
- `.github/workflows/upload-database.yml` - Updated with correct project ID
- `working-key-base64.txt` - Contains the base64 encoded key

## Expected Result
After updating the GitHub secret, the workflow should:
1. Authenticate successfully with Google Cloud
2. Connect to Firestore in project `sunny-furnace-461114-s9`
3. Upload the database files to Firestore collections
4. Complete without the "unterminated string" error

## Troubleshooting
If you still get errors:
- Make sure you copied the ENTIRE base64 string (no line breaks)
- Verify the secret is saved correctly in GitHub
- Check that the service account has proper permissions in the Google Cloud project
