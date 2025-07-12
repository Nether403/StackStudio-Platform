/**
 * Community Features System
 * Social features for developer collaboration and knowledge sharing
 */

import { User as NextAuthUser } from 'next-auth';

export interface DeveloperProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  twitter: string;
  linkedin: string;
  skills: string[];
  experience: 'junior' | 'mid' | 'senior' | 'lead';
  interests: string[];
  availability: 'available' | 'busy' | 'not-available';
  
  // Portfolio
  projects: ProjectShowcase[];
  achievements: Achievement[];
  stats: {
    projectsGenerated: number;
    templatesShared: number;
    helpfulVotes: number;
    mentoringSessions: number;
    communityRank: number;
  };
  
  // Settings
  preferences: {
    publicProfile: boolean;
    showEmail: boolean;
    mentorshipAvailable: boolean;
    collaborationOpen: boolean;
    notifications: {
      mentions: boolean;
      followers: boolean;
      projectUpdates: boolean;
      communityActivity: boolean;
    };
  };
  
  // Social
  followers: string[];
  following: string[];
  reputation: number;
  badges: Badge[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectShowcase {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Media
  screenshots: string[];
  demoUrl: string;
  githubUrl: string;
  
  // Metadata
  featured: boolean;
  likes: number;
  views: number;
  forks: number;
  
  // Community
  tags: string[];
  isTemplate: boolean;
  isOpenSource: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'creation' | 'community' | 'learning' | 'collaboration';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  progress?: {
    current: number;
    total: number;
    milestone: boolean;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  earnedAt: Date;
}

export interface CommunityTemplate {
  id: string;
  authorId: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  
  // Template data
  blueprint: any;
  configFiles: Record<string, string>;
  documentation: string;
  
  // Community metrics
  downloads: number;
  likes: number;
  forks: number;
  stars: number;
  
  // Quality metrics
  rating: number;
  reviews: TemplateReview[];
  tags: string[];
  
  // Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  lastUpdated: Date;
  version: string;
  
  // Visibility
  isPublic: boolean;
  isPremium: boolean;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateReview {
  id: string;
  authorId: string;
  rating: number;
  comment: string;
  helpful: number;
  tags: string[];
  createdAt: Date;
}

export interface CommunityFeedback {
  id: string;
  authorId: string;
  targetId: string;
  targetType: 'project' | 'template' | 'profile' | 'recommendation';
  
  type: 'review' | 'suggestion' | 'issue' | 'praise';
  rating?: number;
  title: string;
  content: string;
  
  // Categorization
  category: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  
  // Community interaction
  helpful: number;
  replies: FeedbackReply[];
  
  // Status
  status: 'open' | 'acknowledged' | 'resolved' | 'closed';
  resolution?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackReply {
  id: string;
  authorId: string;
  content: string;
  helpful: number;
  isAuthorReply: boolean;
  createdAt: Date;
}

export interface CommunityActivity {
  id: string;
  actorId: string;
  type: 'project_created' | 'template_shared' | 'profile_updated' | 'achievement_unlocked' | 'collaboration_started';
  targetId: string;
  targetType: string;
  metadata: any;
  visibility: 'public' | 'followers' | 'private';
  createdAt: Date;
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  topic: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  duration: 'quick' | 'session' | 'ongoing';
  
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  
  // Session details
  sessionNotes?: string;
  resources?: string[];
  followUp?: string;
  
  // Feedback
  menteeRating?: number;
  mentorRating?: number;
  menteeComment?: string;
  mentorComment?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export class CommunitySystem {
  private profiles: Map<string, DeveloperProfile> = new Map();
  private templates: Map<string, CommunityTemplate> = new Map();
  private feedback: Map<string, CommunityFeedback> = new Map();
  private activities: CommunityActivity[] = [];
  private mentorshipRequests: Map<string, MentorshipRequest> = new Map();

  /**
   * Create or update developer profile
   */
  public async createProfile(user: NextAuthUser, additionalData: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
    const profile: DeveloperProfile = {
      id: this.generateId(),
      userId: user.email || 'unknown',
      username: additionalData.username || user.name || 'developer',
      displayName: user.name || 'Developer',
      avatar: user.image || '/default-avatar.png',
      bio: additionalData.bio || '',
      location: additionalData.location || '',
      website: additionalData.website || '',
      github: additionalData.github || '',
      twitter: additionalData.twitter || '',
      linkedin: additionalData.linkedin || '',
      skills: additionalData.skills || [],
      experience: additionalData.experience || 'mid',
      interests: additionalData.interests || [],
      availability: additionalData.availability || 'available',
      
      projects: [],
      achievements: [],
      stats: {
        projectsGenerated: 0,
        templatesShared: 0,
        helpfulVotes: 0,
        mentoringSessions: 0,
        communityRank: 0,
      },
      
      preferences: {
        publicProfile: true,
        showEmail: false,
        mentorshipAvailable: false,
        collaborationOpen: true,
        notifications: {
          mentions: true,
          followers: true,
          projectUpdates: true,
          communityActivity: false,
        },
      },
      
      followers: [],
      following: [],
      reputation: 0,
      badges: [],
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.profiles.set(profile.id, profile);
    
    // Award welcome achievement
    await this.awardAchievement(profile.id, 'welcome');
    
    return profile;
  }

  /**
   * Update developer profile
   */
  public async updateProfile(profileId: string, updates: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error('Profile not found');

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };

    this.profiles.set(profileId, updatedProfile);
    
    // Track activity
    await this.trackActivity({
      actorId: profileId,
      type: 'profile_updated',
      targetId: profileId,
      targetType: 'profile',
      metadata: { updatedFields: Object.keys(updates) },
      visibility: 'public',
    });

    return updatedProfile;
  }

  /**
   * Share a project as a template
   */
  public async shareTemplate(
    authorId: string,
    templateData: Partial<CommunityTemplate>
  ): Promise<CommunityTemplate> {
    const template: CommunityTemplate = {
      id: this.generateId(),
      authorId,
      title: templateData.title || 'Untitled Template',
      description: templateData.description || '',
      category: templateData.category || 'general',
      techStack: templateData.techStack || [],
      
      blueprint: templateData.blueprint || {},
      configFiles: templateData.configFiles || {},
      documentation: templateData.documentation || '',
      
      downloads: 0,
      likes: 0,
      forks: 0,
      stars: 0,
      
      rating: 0,
      reviews: [],
      tags: templateData.tags || [],
      
      difficulty: templateData.difficulty || 'intermediate',
      estimatedTime: templateData.estimatedTime || '1-2 hours',
      lastUpdated: new Date(),
      version: '1.0.0',
      
      isPublic: templateData.isPublic !== false,
      isPremium: templateData.isPremium || false,
      isVerified: false,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(template.id, template);
    
    // Update author stats
    await this.updateProfileStats(authorId, { templatesShared: 1 });
    
    // Award achievement
    await this.awardAchievement(authorId, 'template_creator');
    
    // Track activity
    await this.trackActivity({
      actorId: authorId,
      type: 'template_shared',
      targetId: template.id,
      targetType: 'template',
      metadata: { templateTitle: template.title },
      visibility: 'public',
    });

    return template;
  }

  /**
   * Submit feedback on a project/template
   */
  public async submitFeedback(
    authorId: string,
    targetId: string,
    targetType: string,
    feedbackData: Partial<CommunityFeedback>
  ): Promise<CommunityFeedback> {
    const feedback: CommunityFeedback = {
      id: this.generateId(),
      authorId,
      targetId,
      targetType: targetType as any,
      
      type: feedbackData.type || 'review',
      rating: feedbackData.rating,
      title: feedbackData.title || 'Feedback',
      content: feedbackData.content || '',
      
      category: feedbackData.category || 'general',
      tags: feedbackData.tags || [],
      priority: feedbackData.priority || 'medium',
      
      helpful: 0,
      replies: [],
      
      status: 'open',
      resolution: undefined,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.feedback.set(feedback.id, feedback);
    
    // Update template rating if applicable
    if (targetType === 'template' && feedback.rating) {
      await this.updateTemplateRating(targetId, feedback.rating);
    }
    
    // Award achievement for helpful feedback
    await this.awardAchievement(authorId, 'feedback_provider');

    return feedback;
  }

  /**
   * Request mentorship
   */
  public async requestMentorship(
    menteeId: string,
    mentorId: string,
    requestData: Partial<MentorshipRequest>
  ): Promise<MentorshipRequest> {
    const request: MentorshipRequest = {
      id: this.generateId(),
      menteeId,
      mentorId,
      topic: requestData.topic || 'General Development',
      description: requestData.description || '',
      urgency: requestData.urgency || 'medium',
      duration: requestData.duration || 'session',
      
      status: 'pending',
      scheduledAt: requestData.scheduledAt,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mentorshipRequests.set(request.id, request);
    
    // Notify mentor (in a real app, this would send a notification)
    console.log(`Mentorship request sent to ${mentorId}`);

    return request;
  }

  /**
   * Follow a user
   */
  public async followUser(followerId: string, followingId: string): Promise<void> {
    const followerProfile = this.profiles.get(followerId);
    const followingProfile = this.profiles.get(followingId);
    
    if (!followerProfile || !followingProfile) {
      throw new Error('Profile not found');
    }

    // Add to following list
    if (!followerProfile.following.includes(followingId)) {
      followerProfile.following.push(followingId);
    }

    // Add to followers list
    if (!followingProfile.followers.includes(followerId)) {
      followingProfile.followers.push(followerId);
    }

    // Update both profiles
    this.profiles.set(followerId, followerProfile);
    this.profiles.set(followingId, followingProfile);
    
    // Award achievement for networking
    await this.awardAchievement(followerId, 'networker');
  }

  /**
   * Like a template
   */
  public async likeTemplate(userId: string, templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    template.likes++;
    template.updatedAt = new Date();
    
    this.templates.set(templateId, template);
    
    // Update author stats
    await this.updateProfileStats(template.authorId, { helpfulVotes: 1 });
  }

  /**
   * Award achievement to user
   */
  public async awardAchievement(profileId: string, achievementType: string): Promise<void> {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    const achievement = this.createAchievement(achievementType);
    
    // Check if user already has this achievement
    const hasAchievement = profile.achievements.some(a => a.id === achievement.id);
    if (hasAchievement) return;

    profile.achievements.push(achievement);
    profile.reputation += this.getAchievementValue(achievement.rarity);
    
    this.profiles.set(profileId, profile);
    
    // Track activity
    await this.trackActivity({
      actorId: profileId,
      type: 'achievement_unlocked',
      targetId: achievement.id,
      targetType: 'achievement',
      metadata: { achievementName: achievement.title },
      visibility: 'public',
    });
  }

  /**
   * Get user's community dashboard
   */
  public async getCommunityDashboard(userId: string): Promise<any> {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const recentActivities = this.activities
      .filter(a => a.actorId === userId || profile.following.includes(a.actorId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);

    const trendingTemplates = Array.from(this.templates.values())
      .filter(t => t.isPublic)
      .sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads))
      .slice(0, 10);

    const recommendedMentors = Array.from(this.profiles.values())
      .filter(p => p.preferences.mentorshipAvailable && p.id !== userId)
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 5);

    return {
      profile,
      recentActivities,
      trendingTemplates,
      recommendedMentors,
      stats: {
        totalProfiles: this.profiles.size,
        totalTemplates: this.templates.size,
        totalFeedback: this.feedback.size,
        activeMentorships: Array.from(this.mentorshipRequests.values())
          .filter(r => r.status === 'accepted').length,
      },
    };
  }

  /**
   * Search community
   */
  public async searchCommunity(query: string, filters: any = {}): Promise<any> {
    const results: {
      profiles: DeveloperProfile[];
      templates: CommunityTemplate[];
      projects: any[];
    } = {
      profiles: [],
      templates: [],
      projects: [],
    };

    const searchTerms = query.toLowerCase().split(' ');

    // Search profiles
    if (!filters.type || filters.type === 'profiles') {
      results.profiles = Array.from(this.profiles.values())
        .filter(p => {
          const searchText = `${p.displayName} ${p.bio} ${p.skills.join(' ')}`.toLowerCase();
          return searchTerms.some(term => searchText.includes(term));
        })
        .slice(0, 20);
    }

    // Search templates
    if (!filters.type || filters.type === 'templates') {
      results.templates = Array.from(this.templates.values())
        .filter(t => {
          const searchText = `${t.title} ${t.description} ${t.tags.join(' ')}`.toLowerCase();
          return searchTerms.some(term => searchText.includes(term));
        })
        .slice(0, 20);
    }

    return results;
  }

  /**
   * Get community insights
   */
  public getCommunityInsights(): any {
    const profiles = Array.from(this.profiles.values());
    const templates = Array.from(this.templates.values());
    
    return {
      totalUsers: profiles.length,
      activeUsers: profiles.filter(p => 
        new Date().getTime() - p.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000
      ).length,
      totalTemplates: templates.length,
      totalDownloads: templates.reduce((sum, t) => sum + t.downloads, 0),
      
      topSkills: this.getTopSkills(profiles),
      topTemplateCategories: this.getTopTemplateCategories(templates),
      mostActiveUsers: profiles
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 10)
        .map(p => ({ id: p.id, name: p.displayName, reputation: p.reputation })),
      
      growthMetrics: {
        newUsersThisWeek: profiles.filter(p => 
          new Date().getTime() - p.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
        ).length,
        newTemplatesThisWeek: templates.filter(t => 
          new Date().getTime() - t.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
        ).length,
      },
    };
  }

  // Helper methods
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createAchievement(type: string): Achievement {
    const achievements = {
      welcome: {
        title: 'Welcome to the Community!',
        description: 'Created your first profile',
        icon: '🎉',
        category: 'community',
        rarity: 'common',
      },
      template_creator: {
        title: 'Template Creator',
        description: 'Shared your first template',
        icon: '📝',
        category: 'creation',
        rarity: 'uncommon',
      },
      feedback_provider: {
        title: 'Helpful Reviewer',
        description: 'Provided valuable feedback',
        icon: '💬',
        category: 'community',
        rarity: 'common',
      },
      networker: {
        title: 'Networker',
        description: 'Connected with other developers',
        icon: '🤝',
        category: 'community',
        rarity: 'common',
      },
    };

    const achievement = achievements[type as keyof typeof achievements];
    if (!achievement) throw new Error(`Unknown achievement type: ${type}`);

    return {
      id: `${type}_${Date.now()}`,
      ...achievement,
      unlockedAt: new Date(),
    } as Achievement;
  }

  private getAchievementValue(rarity: string): number {
    const values = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      legendary: 250,
    };
    return values[rarity as keyof typeof values] || 10;
  }

  private async trackActivity(activity: Omit<CommunityActivity, 'id' | 'createdAt'>): Promise<void> {
    this.activities.push({
      ...activity,
      id: this.generateId(),
      createdAt: new Date(),
    });
  }

  private async updateProfileStats(profileId: string, stats: Partial<DeveloperProfile['stats']>): Promise<void> {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    Object.entries(stats).forEach(([key, value]) => {
      (profile.stats as any)[key] += value;
    });

    this.profiles.set(profileId, profile);
  }

  private async updateTemplateRating(templateId: string, newRating: number): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) return;

    const totalReviews = template.reviews.length;
    const currentRating = template.rating;
    
    template.rating = (currentRating * totalReviews + newRating) / (totalReviews + 1);
    
    this.templates.set(templateId, template);
  }

  private getTopSkills(profiles: DeveloperProfile[]): { skill: string; count: number }[] {
    const skillCounts = new Map<string, number>();
    
    profiles.forEach(p => {
      p.skills.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });
    });

    return Array.from(skillCounts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopTemplateCategories(templates: CommunityTemplate[]): { category: string; count: number }[] {
    const categoryCounts = new Map<string, number>();
    
    templates.forEach(t => {
      categoryCounts.set(t.category, (categoryCounts.get(t.category) || 0) + 1);
    });

    return Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// Export singleton instance
export const communitySystem = new CommunitySystem();
