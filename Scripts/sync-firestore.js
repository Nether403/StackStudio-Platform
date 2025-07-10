/*
 * Firestore Sync Script
 *
 * This script reads all .json files from the ../database/ directory,
 * and uploads the contents of each file to a Firestore collection
 * with the same name as the file.
 *
 * It's designed to be run by a CI/CD pipeline like a GitHub Action.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// --- 1. Initialization ---
// Initialize Firebase Admin SDK.
// In a GitHub Action, authentication is handled by the environment.
initializeApp();
const db = getFirestore();

const dataDir = path.join(__dirname, '../database');

// --- 2. Main Sync Function ---
async function syncFirestore() {
  console.log('Starting Firestore sync...');

  try {
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      const filePath = path.join(dataDir, file);
      
      console.log(`\nProcessing ${file} -> collection '${collectionName}'...`);

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const documents = JSON.parse(fileContent);

      if (!Array.isArray(documents)) {
        console.error(`  ERROR: ${file} does not contain a JSON array. Skipping.`);
        continue;
      }

      // Use a batch write for efficiency
      const batch = db.batch();
      let count = 0;

      for (const doc of documents) {
        if (!doc.id) {
          console.warn(`  WARNING: Document in ${file} is missing 'id'. Skipping.`);
          continue;
        }
        // Get a reference to the document in the collection using its ID
        const docRef = db.collection(collectionName).doc(doc.id);
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
    console.error(error);
    process.exit(1); // Exit with an error code
  }
}

// --- 3. Run the script ---
syncFirestore();
