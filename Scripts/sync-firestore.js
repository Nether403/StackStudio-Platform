/*
 * Firestore Sync Script - WIF Compatible
 *
 * This script reads all .json files from the ../Database/ directory,
 * and uploads the contents of each file to a Firestore collection
 * with the same name as the file.
 *
 * Modified for Workload Identity Federation (WIF) compatibility.
 */

const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

// --- 1. Initialization ---
// Initialize Firestore with WIF-compatible authentication
const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'sunny-furnace-461114-s9';
console.log(`Initializing Firestore with project: ${projectId}`);

// Use Google Cloud Firestore client instead of Firebase Admin SDK
const firestore = new Firestore({
  projectId: projectId,
  // Let Google Cloud SDK handle authentication automatically
});

console.log('Firestore initialized successfully with WIF credentials');

// Handle both Database and database directory names
const dataDir = path.join(__dirname, '../Database');
const fallbackDataDir = path.join(__dirname, '../database');

// Check which directory exists
let actualDataDir;
if (fs.existsSync(dataDir)) {
  actualDataDir = dataDir;
  console.log('Using Database directory (capitalized)');
} else if (fs.existsSync(fallbackDataDir)) {
  actualDataDir = fallbackDataDir;
  console.log('Using database directory (lowercase)');
} else {
  console.error('ERROR: Neither Database nor database directory found!');
  process.exit(1);
}

// --- 2. Main Sync Function ---
async function syncFirestore() {
  console.log('Starting Firestore sync...');
  console.log(`Reading from directory: ${actualDataDir}`);

  try {
    const files = fs.readdirSync(actualDataDir).filter(file => file.endsWith('.json'));
    console.log(`Found ${files.length} JSON files to sync`);

    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      const filePath = path.join(actualDataDir, file);
      
      console.log(`\nProcessing ${file} -> collection '${collectionName}'...`);

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const documents = JSON.parse(fileContent);

      if (!Array.isArray(documents)) {
        console.error(`  ERROR: ${file} does not contain a JSON array. Skipping.`);
        continue;
      }

      // Use a batch write for efficiency
      const batch = firestore.batch();
      let count = 0;

      for (const doc of documents) {
        if (!doc.id) {
          console.warn(`  WARNING: Document in ${file} is missing 'id'. Skipping.`);
          continue;
        }
        // Get a reference to the document in the collection using its ID
        const docRef = firestore.collection(collectionName).doc(doc.id);
        // Add a 'set' operation to the batch. This will create or overwrite the document.
        batch.set(docRef, doc);
        count++;
      }

      // Commit the batch
      await batch.commit();
      console.log(`  SUCCESS: Synced ${count} documents to '${collectionName}'.`);
    }

    console.log('\nFirestore sync completed successfully!');

  } catch (error) {
    console.error('\nFATAL: An error occurred during the Firestore sync process:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Provide specific help for common errors
    if (error.code === 5) {
      console.error('\n🚨 SPECIFIC ERROR: Firestore database NOT_FOUND (Error Code 5)');
      console.error('This usually means:');
      console.error('1. The Firestore database has not been created in your Google Cloud project');
      console.error('2. The project ID is incorrect');
      console.error('3. The service account lacks permission to access Firestore');
      console.error('\nSOLUTION: The workflow should now automatically create the Firestore database.');
      console.error('If this error persists, manually create a Firestore database in the Google Cloud Console.');
    }
    
    console.error('\nEnvironment variables:');
    console.error('GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
    console.error('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.error('GCP_SERVICE_ACCOUNT_KEY present:', !!process.env.GCP_SERVICE_ACCOUNT_KEY);
    
    process.exit(1); // Exit with an error code
  }
}

// --- 3. Run the script ---
syncFirestore();
