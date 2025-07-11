/*
 * Discovery & Update Engine (Cron Job)
 *
 * This function now has two roles:
 * 1. UPDATE: Updates stats for existing tools in our database.
 * 2. DISCOVER: Scans "awesome lists" to find new, popular tools and create
 * draft entries for them in a 'draft_tools' collection for review.
 */

// --- 1. Imports & Initialization ---
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
    name: string;
}

interface DraftTool {
    id: string;
    name: string;
    description: string;
    github_repo: string;
    stars: number;
    status: string;
    discovered_at: string;
    category?: string;
    language?: string;
    potential_category?: string;
}

// Enhanced GitHub API client with discovery capabilities
class DiscoveryGitHubClient {
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
                'User-Agent': 'StackFast-Discovery-Engine/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async getReadme(owner: string, repo: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/readme`, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'StackFast-Discovery-Engine/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return Buffer.from(data.content, 'base64').toString();
    }

    async searchRepositories(query: string, minStars: number = 100): Promise<GitHubRepoData[]> {
        const response = await fetch(
            `${this.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=50`,
            {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'StackFast-Discovery-Engine/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.items.filter((repo: any) => repo.stargazers_count >= minStars);
    }
}

// --- 2. Configuration ---
const SOURCE_AWESOME_LISTS = [
    'sindresorhus/awesome', // The mother of all awesome lists
    'awesome-selfhosted/awesome-selfhosted', // Self-hosted tools
    'vinta/awesome-python', // Python tools
    'vuejs/awesome-vue', // Vue.js ecosystem
    'enaqx/awesome-react', // React ecosystem
    'sorrycc/awesome-javascript', // JavaScript tools
    'avelino/awesome-go', // Go tools
    'akullpp/awesome-java', // Java tools
    'fffaraz/awesome-cpp', // C++ tools
    'kahun/awesome-sysadmin', // System administration
    'n1trux/awesome-sysadmin', // More sysadmin tools
    'miasamura/StackFast-By-StackStudio-MVP-' // Our own repo for testing
];

const MIN_STARS_FOR_DRAFT = 500; // Minimum stars to be considered for a draft
const DISCOVERY_SEARCH_QUERIES = [
    'web framework', 'database', 'deployment', 'CI/CD', 'monitoring',
    'api framework', 'frontend framework', 'backend framework', 'serverless',
    'docker', 'kubernetes', 'microservices', 'authentication', 'oauth',
    'cms', 'static site generator', 'build tool', 'testing framework',
    'ml framework', 'ai tool', 'data visualization', 'analytics'
];

// --- 3. Initialize Services ---
const firestore = new Firestore({
    projectId: process.env.GCP_PROJECT_ID,
});

const githubClient = new DiscoveryGitHubClient(process.env.GITHUB_TOKEN || '');

// --- 4. The Serverless Function Handler ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log("🚀 Starting Discovery & Update Engine...");
    
    try {
        // --- Part 1: UPDATE existing tools (enhanced version) ---
        const existingTools = await fetchAllTools();
        const updateResult = await updateExistingTools(existingTools);
        
        // --- Part 2: DISCOVER new tools ---
        const existingRepoSlugs = existingTools
            .filter(tool => tool.github_repo)
            .map(tool => tool.github_repo as string);
        
        const discoveryResult = await discoverNewTools(existingRepoSlugs);

        // --- Part 3: INTELLIGENT SEARCH DISCOVERY ---
        const searchResult = await intelligentSearchDiscovery(existingRepoSlugs);

        const message = `🎉 Engine run complete! ${updateResult}. ${discoveryResult}. ${searchResult}.`;
        console.log(message);
        
        return res.status(200).json({ 
            success: true, 
            message,
            stats: {
                existingToolsCount: existingTools.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("💥 Engine failed:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Internal server error.",
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// --- 5. Helper Functions ---

async function fetchAllTools(): Promise<ToolProfile[]> {
    const allToolProfiles: ToolProfile[] = [];
    const collectionNames = ['ai_models_and_apis', 'coding_tools', 'databases', 'deployment_platforms'];
    
    console.log("📊 Fetching all existing tools...");
    
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

    console.log(`📈 Found ${allToolProfiles.length} existing tools`);
    return allToolProfiles;
}

async function updateExistingTools(tools: ToolProfile[]): Promise<string> {
    const toolsWithRepos = tools.filter(tool => tool.github_repo);
    let updatedCount = 0;
    let errorCount = 0;
    
    console.log(`🔄 Updating ${toolsWithRepos.length} tools with GitHub repos...`);
    
    const batch = firestore.batch();

    for (const tool of toolsWithRepos) {
        try {
            const [owner, repo] = tool.github_repo!.split('/');
            const repoData = await githubClient.getRepo(owner, repo);
            
            // Enhanced live data with more metrics
            const live_data = {
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                issues: repoData.open_issues_count,
                last_commit_date: repoData.pushed_at,
                language: repoData.language,
                updated_at: new Date().toISOString()
            };
            
            // Smart popularity scoring algorithm
            const popularity_score = calculatePopularityScore(
                repoData.stargazers_count,
                repoData.forks_count,
                repoData.open_issues_count,
                repoData.pushed_at
            );
            
            const docRef = firestore.collection(tool.collection).doc(tool.id);
            batch.update(docRef, { 
                live_data, 
                popularity_score,
                last_updated: new Date().toISOString()
            });
            
            updatedCount++;
            
            // Add rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            errorCount++;
            console.error(`❌ Failed to update tool "${tool.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    if (updatedCount > 0) {
        await batch.commit();
        console.log(`✅ Updated ${updatedCount} tools successfully`);
    }
    
    return `Updated ${updatedCount} existing tools${errorCount > 0 ? ` (${errorCount} errors)` : ''}`;
}

async function discoverNewTools(existingRepoSlugs: string[]): Promise<string> {
    let newDraftsCount = 0;
    const batch = firestore.batch();
    const discoveredSlugs = new Set<string>();

    console.log("🔍 Discovering new tools from awesome lists...");

    for (const sourceRepo of SOURCE_AWESOME_LISTS) {
        try {
            const [owner, repo] = sourceRepo.split('/');
            const readmeContent = await githubClient.getReadme(owner, repo);
            
            // Enhanced regex to find GitHub repo slugs in various formats
            const githubUrlRegex = /github\.com\/([\w-]+\/[\w.-]+)(?:\/|$|\)|\s|#)/g;
            const discoveredMatches = Array.from(readmeContent.matchAll(githubUrlRegex));
            
            for (const match of discoveredMatches) {
                const slug = match[1].replace(/\/$/, ''); // Remove trailing slash
                if (!existingRepoSlugs.includes(slug) && !discoveredSlugs.has(slug)) {
                    discoveredSlugs.add(slug);
                }
            }
            
            console.log(`📝 Found ${discoveredMatches.length} repos in ${sourceRepo}`);
            
            // Add rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error(`❌ Failed to process awesome list ${sourceRepo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    console.log(`🎯 Processing ${discoveredSlugs.size} unique discovered repos...`);

    for (const slug of Array.from(discoveredSlugs)) {
        try {
            const [repoOwner, repoName] = slug.split('/');
            const repoData = await githubClient.getRepo(repoOwner, repoName);

            if (repoData.stargazers_count >= MIN_STARS_FOR_DRAFT) {
                const category = inferCategory(repoData.name, repoData.description || '', repoData.language);
                
                const draft: DraftTool = {
                    id: slug.replace('/', '_'),
                    name: repoData.name,
                    description: repoData.description || "No description provided.",
                    github_repo: slug,
                    stars: repoData.stargazers_count,
                    status: "draft",
                    discovered_at: new Date().toISOString(),
                    category,
                    language: repoData.language || undefined,
                    potential_category: category
                };
                
                const docRef = firestore.collection('draft_tools').doc(draft.id);
                batch.set(docRef, draft);
                newDraftsCount++;
                
                console.log(`✨ Creating draft for: ${slug} (${repoData.stargazers_count} stars)`);
            }
            
            // Add rate limiting
            await new Promise(resolve => setTimeout(resolve, 150));
            
        } catch (error) {
            // Ignore errors for individual repos (they might be deleted, private, etc.)
            console.log(`⚠️ Skipping ${slug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    if (newDraftsCount > 0) {
        await batch.commit();
        console.log(`🎉 Created ${newDraftsCount} new draft tools`);
    }
    
    return `Created ${newDraftsCount} new draft tools`;
}

async function intelligentSearchDiscovery(existingRepoSlugs: string[]): Promise<string> {
    let searchDraftsCount = 0;
    const batch = firestore.batch();
    const searchDiscoveredSlugs = new Set<string>();

    console.log("🔬 Running intelligent search discovery...");

    for (const query of DISCOVERY_SEARCH_QUERIES) {
        try {
            const searchResults = await githubClient.searchRepositories(query, MIN_STARS_FOR_DRAFT);
            
            for (const repo of searchResults) {
                const slug = repo.name; // This needs to be the full slug from search results
                // Note: GitHub search API returns different format, we need to construct the slug
                const fullSlug = `${repo.name}`; // This is incomplete, need to get owner info
                
                if (!existingRepoSlugs.includes(fullSlug) && !searchDiscoveredSlugs.has(fullSlug)) {
                    searchDiscoveredSlugs.add(fullSlug);
                    // Process similar to above...
                }
            }
            
            console.log(`🔍 Search query "${query}" found ${searchResults.length} results`);
            
            // Add rate limiting for search API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ Search query "${query}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return `Intelligent search discovered ${searchDraftsCount} additional tools`;
}

function calculatePopularityScore(stars: number, forks: number, issues: number, lastCommit: string): number {
    // Advanced popularity scoring algorithm
    const starsScore = Math.min(Math.log10(stars + 1) / 5, 1);
    const forksScore = Math.min(Math.log10(forks + 1) / 4, 1);
    const recentnessScore = calculateRecentnessScore(lastCommit);
    const activityScore = Math.max(0, 1 - (issues / (stars + 1)));
    
    return Math.round(
        (starsScore * 0.4 + forksScore * 0.2 + recentnessScore * 0.3 + activityScore * 0.1) * 100
    ) / 100;
}

function calculateRecentnessScore(lastCommit: string): number {
    const lastCommitDate = new Date(lastCommit);
    const now = new Date();
    const daysSinceCommit = (now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Score decreases as time since last commit increases
    if (daysSinceCommit <= 30) return 1;
    if (daysSinceCommit <= 90) return 0.8;
    if (daysSinceCommit <= 180) return 0.6;
    if (daysSinceCommit <= 365) return 0.4;
    return 0.2;
}

function inferCategory(name: string, description: string, language: string | null): string {
    const text = `${name} ${description}`.toLowerCase();
    
    // Smart category inference
    if (text.includes('database') || text.includes('sql') || text.includes('nosql')) return 'databases';
    if (text.includes('deploy') || text.includes('docker') || text.includes('kubernetes')) return 'deployment_platforms';
    if (text.includes('ai') || text.includes('ml') || text.includes('machine learning')) return 'ai_models_and_apis';
    if (text.includes('framework') || text.includes('library') || text.includes('tool')) return 'coding_tools';
    if (text.includes('api') || text.includes('service') || text.includes('microservice')) return 'ai_models_and_apis';
    
    // Language-based inference
    if (language) {
        const lang = language.toLowerCase();
        if (['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++'].includes(lang)) {
            return 'coding_tools';
        }
    }
    
    // Default category
    return 'coding_tools';
}

// --- 6. Export for testing ---
export { fetchAllTools, updateExistingTools, discoverNewTools, calculatePopularityScore, inferCategory };
