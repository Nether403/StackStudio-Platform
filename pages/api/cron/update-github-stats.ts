/*
 * Scheduled Cron Job: Update GitHub Stats
 *
 * This serverless function is designed to be run on a schedule (e.g., daily).
 * It fetches all tool profiles from Firestore, calls the GitHub API for each
 * one that has a `github_repo` field, and updates the `live_data` in Firestore.
 */

// --- 1. Imports ---
import type { NextApiRequest, NextApiResponse } from 'next';
import { Firestore } from '@google-cloud/firestore';

// Define types for better type safety
interface ToolProfile {
    id: string;
    collection: string;
    name: string;
    github_repo?: string;
    description?: string;
    [key: string]: any;
}

interface GitHubRepoData {
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    pushed_at: string;
    language: string | null;
    description: string | null;
}

// Simple GitHub API client without external dependencies
class SimpleGitHubClient {
    private token: string;
    private baseUrl = 'https://api.github.com';

    constructor(token: string) {
        this.token = token;
    }

    async getRepo(owner: string, repo: string): Promise<GitHubRepoData> {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'StackFast-GitHub-Stats-Updater/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}

// --- 2. Initialization ---
// Initialize Firestore with WIF credentials
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

// Initialize GitHub API client
const githubClient = new SimpleGitHubClient(process.env.GITHUB_TOKEN || '');

// --- 3. The Serverless Function Handler ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Security: In production, protect this endpoint with a secret key
    // to prevent unauthorized execution.
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log("Starting GitHub stats update cron job...");
    
    try {
        const allToolProfiles: ToolProfile[] = [];
        const collectionNames = ['ai_models_and_apis', 'coding_tools', 'databases', 'deployment_platforms'];
        
        // Fetch all documents from all relevant collections
        const snapshots = await Promise.all(
            collectionNames.map(name => firestore.collection(name).get())
        );
        
        snapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
                allToolProfiles.push({ 
                    id: doc.id, 
                    collection: doc.ref.parent.id, 
                    ...doc.data() 
                } as ToolProfile);
            });
        });

        const toolsWithRepos = allToolProfiles.filter(tool => tool.github_repo);
        console.log(`Found ${toolsWithRepos.length} tools with GitHub repositories to update.`);

        let updatedCount = 0;
        const batch = firestore.batch(); // Use a single batch for all updates
        const errors: string[] = [];

        for (const tool of toolsWithRepos) {
            try {
                const [owner, repo] = tool.github_repo!.split('/');
                if (!owner || !repo) {
                    console.warn(`Skipping tool "${tool.name}" due to invalid repo slug: ${tool.github_repo}`);
                    continue;
                }

                // Fetch repository data from GitHub API
                const repoData = await githubClient.getRepo(owner, repo);
                
                const stars = repoData.stargazers_count;
                const forks = repoData.forks_count;
                const issues = repoData.open_issues_count;
                const last_commit_date = repoData.pushed_at; // pushed_at is a good indicator of recent activity
                const language = repoData.language;
                const description = repoData.description;

                // Prepare the data to be updated in Firestore
                const live_data = {
                    stars,
                    forks,
                    issues,
                    last_commit_date,
                    language,
                    description: description || tool.description || '',
                    updated_at: new Date().toISOString(),
                };
                
                // Normalize the popularity_score to be between 0 and 1
                // Using a logarithmic scale to prevent outliers from dominating.
                // A repo with 100k stars shouldn't be 100x better than one with 1k.
                const popularity_score = Math.min(Math.log10(stars + 1) / 5, 1); // Capped at 100k stars for max score
                
                // Calculate activity score based on recent commits
                const lastCommitDate = new Date(last_commit_date);
                const daysSinceLastCommit = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
                const activity_score = Math.max(0, 1 - daysSinceLastCommit / 365); // Decreases over a year

                // Get a reference to the document and add the update to the batch
                const docRef = firestore.collection(tool.collection).doc(tool.id);
                batch.update(docRef, { 
                    live_data, 
                    popularity_score: parseFloat(popularity_score.toFixed(4)),
                    activity_score: parseFloat(activity_score.toFixed(4))
                });

                console.log(`Successfully processed ${tool.name} with ${stars} stars. New popularity: ${popularity_score.toFixed(4)}`);
                updatedCount++;

                // Add a small delay to respect GitHub API rate limits
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                const errorMsg = `Failed to update tool "${tool.name}". Error: ${error instanceof Error ? error.message : String(error)}`;
                console.error(errorMsg);
                errors.push(errorMsg);
            }
        }
        
        // Commit all updates at once
        await batch.commit();

        const message = `GitHub stats update complete. Updated ${updatedCount} of ${toolsWithRepos.length} tools.`;
        console.log(message);
        
        const response = {
            success: true,
            message,
            stats: {
                total_tools: allToolProfiles.length,
                tools_with_repos: toolsWithRepos.length,
                updated_count: updatedCount,
                error_count: errors.length
            },
            errors: errors.length > 0 ? errors : undefined
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error("Cron job failed with an unexpected error:", error);
        return res.status(500).json({ 
            success: false, 
            error: "An internal server error occurred.",
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
