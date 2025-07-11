// API endpoint for generating project blueprints with cost projection
// This endpoint processes user input and returns AI-generated stack recommendations with cost estimates

import { NextApiRequest, NextApiResponse } from 'next';
import { generateBlueprint } from '../../Engine/stack-recommendation-engine';

// Mock tool profiles for the blueprint generator
const mockToolProfiles = [
  {
    id: "nextjs",
    name: "Next.js",
    category: "Frontend Framework",
    skills: { setup: 2, daily: 2 },
    pricing_model: "free",
    baseline_cost: 0,
    compatible_with: ["React", "Vercel"],
    popularity_score: 0.95,
    community_sentiment: "highly_positive",
    costModel: {
      type: "Free" as const,
      base_cost_monthly: 0,
      free_tier_details: "Open source framework, completely free to use",
      link: "https://nextjs.org"
    }
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "Code Generation",
    skills: { setup: 1, daily: 1 },
    pricing_model: "freemium",
    baseline_cost: 10,
    compatible_with: ["VS Code", "JetBrains IDEs"],
    popularity_score: 0.9,
    community_sentiment: "highly_positive",
    costModel: {
      type: "Subscription" as const,
      base_cost_monthly: 10,
      free_tier_details: "Free for verified students and maintainers of popular open-source projects",
      link: "https://github.com/features/copilot#pricing"
    }
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Deployment Platform",
    skills: { setup: 1, daily: 2 },
    pricing_model: "freemium",
    baseline_cost: 0,
    compatible_with: ["Next.js", "React", "Vue"],
    popularity_score: 0.9,
    community_sentiment: "highly_positive",
    costModel: {
      type: "Subscription" as const,
      base_cost_monthly: 0,
      free_tier_details: "Free tier includes 100GB bandwidth and 6,000 build minutes per month",
      link: "https://vercel.com/pricing"
    }
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Backend as a Service",
    skills: { setup: 1, daily: 2 },
    pricing_model: "freemium",
    baseline_cost: 0,
    compatible_with: ["PostgreSQL", "Next.js"],
    popularity_score: 0.85,
    community_sentiment: "positive",
    costModel: {
      type: "Subscription" as const,
      base_cost_monthly: 0,
      free_tier_details: "Free tier includes 2 projects, 500MB database, 5GB bandwidth",
      link: "https://supabase.com/pricing"
    }
  },
  {
    id: "openai_gpt4",
    name: "OpenAI GPT-4",
    category: "AI/ML API",
    skills: { setup: 2, daily: 3 },
    pricing_model: "usage-based",
    baseline_cost: 0,
    compatible_with: ["Python", "JavaScript", "REST API"],
    popularity_score: 0.95,
    community_sentiment: "highly_positive",
    costModel: {
      type: "Pay-as-you-go" as const,
      base_cost_monthly: 0,
      unit_cost: 0.03,
      unit_type: "per_1k_tokens_input",
      free_tier_details: "No free tier for GPT-4 API",
      link: "https://openai.com/pricing"
    }
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Database",
    skills: { setup: 3, daily: 2 },
    pricing_model: "free",
    baseline_cost: 0,
    compatible_with: ["Node.js", "Python", "Docker"],
    popularity_score: 0.9,
    community_sentiment: "highly_positive",
    costModel: {
      type: "Free" as const,
      base_cost_monthly: 0,
      free_tier_details: "Open source database, completely free to use",
      link: "https://www.postgresql.org"
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectIdea, skillProfile, preferredToolIds } = req.body;

    if (!projectIdea || !skillProfile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate blueprint using the new engine
    const blueprint = generateBlueprint(
      {
        projectIdea,
        skillProfile,
        preferredToolIds: preferredToolIds || []
      },
      mockToolProfiles
    );

    return res.status(200).json(blueprint);
  } catch (error) {
    console.error('Blueprint generation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
