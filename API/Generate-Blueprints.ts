/*
 * Vercel/Netlify Style Serverless Function
 *
 * File: /api/generate-blueprint.ts
 * Version: 3.0 (with Multi-Collection Firestore Support)
 *
 * This function now queries multiple collections in Firestore, combines the results,
 * and then passes the complete list of tools to the recommendation engine.
 */

// --- 1. Imports ---
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- 2. Firebase Admin SDK Initialization ---
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : {};

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// --- 3. Engine Logic (Imported) ---
import { generateBlueprint, type ToolProfile } from '../Engine/stack-recommendation-engine';
import { generateEnhancedBlueprint } from '../Engine/hybrid-ai-recommendation-engine';

// --- 4. The Serverless Function Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // --- A. Fetch Tool Profiles from Multiple Firestore Collections ---
        const collectionNames = [
            'ai_models_and_apis',
            'coding_tools',
            'databases',
            'deployment_platforms',
            // Add 'boilerplates', 'mcp_servers', etc. here as they get populated
        ];

        // Create an array of promises, one for each collection query
        const collectionPromises = collectionNames.map(name => db.collection(name).get());

        // Execute all queries in parallel
        const snapshots = await Promise.all(collectionPromises);

        // Combine the results from all collections into a single array
        const toolProfiles = snapshots.flatMap(snapshot => 
            snapshot.docs.map(doc => doc.data())
        );

        if (toolProfiles.length === 0) {
            console.error("No tool profiles found in any of the specified collections.");
            return res.status(500).json({ error: "Could not retrieve any tool data." });
        }

        // --- B. Get and Validate User Input ---
        const inputBody = req.body;
        if (!inputBody || !inputBody.projectIdea || !inputBody.skillProfile) {
            return res.status(400).json({ error: "Invalid request body is missing required fields." });
        }

        // --- C. Execute Core Logic with AI Enhancement ---
        let blueprint;
        
        // Check for AI API key based on provider
        const aiProvider = process.env.AI_PROVIDER || 'gemini';
        let hasAiApiKey = false;
        
        switch (aiProvider) {
            case 'gemini':
                hasAiApiKey = !!process.env.GEMINI_API_KEY;
                break;
            case 'openai':
                hasAiApiKey = !!process.env.OPENAI_API_KEY;
                break;
            case 'xai':
                hasAiApiKey = !!process.env.XAI_API_KEY;
                break;
        }
        
        // Try AI-enhanced blueprint generation first
        if (hasAiApiKey) {
            try {
                blueprint = await generateEnhancedBlueprint(inputBody, toolProfiles as ToolProfile[]);
                console.log(`✅ AI-enhanced blueprint generated successfully using ${aiProvider}`);
            } catch (error) {
                console.warn(`AI enhancement failed (${aiProvider}), falling back to rule-based:`, error);
                blueprint = generateBlueprint(inputBody, toolProfiles as ToolProfile[]);
            }
        } else {
            // Fallback to rule-based generation
            blueprint = generateBlueprint(inputBody, toolProfiles as ToolProfile[]);
            console.log(`ℹ️ Using rule-based blueprint generation (no ${aiProvider} API key)`);
        }

        // --- D. Send Success Response ---
        return res.status(200).json(blueprint);

    } catch (error) {
        console.error("Error in API handler:", error);
        return res.status(500).json({ error: "An internal server error occurred." });
    }
}
