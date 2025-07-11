/*
 * Manual Test Endpoint for GitHub Stats Update
 * This endpoint allows manual testing of the GitHub stats update functionality
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { Firestore } from '@google-cloud/firestore';

// Define type for tool data
interface ToolData {
    id: string;
    collection: string;
    name?: string;
    github_repo?: string;
    popularity_score?: number;
    live_data?: any;
    [key: string]: any;
}

// Initialize Firestore
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get a sample of tools from each collection
        const collectionNames = ['ai_models_and_apis', 'coding_tools', 'databases', 'deployment_platforms'];
        const samples: ToolData[] = [];
        
        for (const collectionName of collectionNames) {
            const snapshot = await firestore.collection(collectionName).limit(3).get();
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                collection: collectionName,
                ...doc.data()
            } as ToolData));
            samples.push(...docs);
        }

        // Filter tools with GitHub repos
        const toolsWithRepos = samples.filter(tool => tool.github_repo);
        
        return res.status(200).json({
            success: true,
            message: 'GitHub stats test endpoint',
            stats: {
                total_samples: samples.length,
                tools_with_repos: toolsWithRepos.length,
                sample_tools: toolsWithRepos.map(tool => ({
                    name: tool.name,
                    repo: tool.github_repo,
                    current_popularity: tool.popularity_score,
                    has_live_data: !!tool.live_data
                }))
            },
            env_check: {
                has_github_token: !!process.env.GITHUB_TOKEN,
                has_cron_secret: !!process.env.CRON_SECRET,
                has_gcp_project: !!process.env.GCP_PROJECT_ID
            }
        });

    } catch (error) {
        console.error('Test endpoint error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
