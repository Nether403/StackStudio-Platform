import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { communitySystem } from '../Engine/community-system';

interface CommunityDashboardProps {
  className?: string;
}

interface ProfileStats {
  totalProjects: number;
  templatesShared: number;
  helpfulVotes: number;
  reputation: number;
  achievements: number;
  followers: number;
}

interface TrendingTemplate {
  id: string;
  title: string;
  author: string;
  likes: number;
  downloads: number;
  techStack: string[];
  difficulty: string;
}

interface CommunityActivity {
  id: string;
  type: string;
  actor: string;
  target: string;
  timestamp: Date;
  metadata: any;
}

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'mentorship' | 'activity'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const data = await communitySystem.getCommunityDashboard(user.uid);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    if (!user) return;
    
    try {
      await communitySystem.followUser(user.uid, userId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleLikeTemplate = async (templateId: string) => {
    if (!user) return;
    
    try {
      await communitySystem.likeTemplate(user.uid, templateId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏘️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Community</h2>
          <p className="text-gray-600 mb-6">Connect with developers, share templates, and learn together</p>
          <button 
            onClick={loadDashboardData}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  const { profile, recentActivities, trendingTemplates, recommendedMentors, stats } = dashboardData;

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Dashboard</h1>
        <p className="text-gray-600">Connect, collaborate, and grow with fellow developers</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'templates', label: 'Templates', icon: '📝' },
          { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
          { id: 'activity', label: 'Activity', icon: '📈' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={profile.avatar || '/default-avatar.png'}
                alt={profile.displayName}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{profile.displayName}</h2>
                <p className="text-gray-600">@{profile.username}</p>
                <p className="text-sm text-gray-500">{profile.bio}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.stats.projectsGenerated}</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.stats.templatesShared}</div>
                <div className="text-sm text-gray-600">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.reputation}</div>
                <div className="text-sm text-gray-600">Reputation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile.achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Community</h3>
                <span className="text-2xl">🌟</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Members</span>
                  <span className="font-medium">{stats.totalProfiles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Templates</span>
                  <span className="font-medium">{stats.totalTemplates.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Mentorships</span>
                  <span className="font-medium">{stats.activeMentorships}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Your Network</h3>
                <span className="text-2xl">🤝</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Following</span>
                  <span className="font-medium">{profile.following.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-medium">{profile.followers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Community Rank</span>
                  <span className="font-medium">#{profile.stats.communityRank || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                <span className="text-2xl">📊</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-medium">{recentActivities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Helpful Votes</span>
                  <span className="font-medium">{profile.stats.helpfulVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mentoring Sessions</span>
                  <span className="font-medium">{profile.stats.mentoringSessions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Templates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔥 Trending Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingTemplates.slice(0, 6).map((template: any) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 truncate">{template.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.techStack.slice(0, 3).map((tech: string, index: number) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {template.techStack.length > 3 && (
                      <span className="text-xs text-gray-500">+{template.techStack.length - 3} more</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span>👍</span>
                        <span>{template.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📥</span>
                        <span>{template.downloads}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLikeTemplate(template.id)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      Like
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Community Templates</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Share Template
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTemplates.map((template: any) => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{template.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    template.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {template.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.techStack.map((tech: string, index: number) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>👍</span>
                      <span>{template.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📥</span>
                      <span>{template.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{template.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLikeTemplate(template.id)}
                    className="text-blue-500 hover:text-blue-700 transition-colors text-sm"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentorship Tab */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Find Mentors</h2>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Become a Mentor
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedMentors.map((mentor: any) => (
              <div key={mentor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={mentor.avatar || '/default-avatar.png'}
                    alt={mentor.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{mentor.displayName}</h3>
                    <p className="text-sm text-gray-600">{mentor.experience} Developer</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{mentor.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.skills.slice(0, 3).map((skill: string, index: number) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {mentor.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{mentor.skills.length - 3} more</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{mentor.reputation}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{mentor.followers.length}</span>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleFollowUser(mentor.id)}
                      className="text-blue-500 hover:text-blue-700 transition-colors text-sm"
                    >
                      Follow
                    </button>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                      Request Mentorship
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Feed</h3>
              <div className="space-y-4">
                {recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                      {activity.type === 'project_created' ? '🚀' :
                       activity.type === 'template_shared' ? '📝' :
                       activity.type === 'achievement_unlocked' ? '🏆' :
                       activity.type === 'collaboration_started' ? '🤝' : '📊'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium text-gray-800">{activity.actorName}</span>
                        <span className="text-gray-600 ml-1">
                          {activity.type === 'project_created' && 'created a new project'}
                          {activity.type === 'template_shared' && 'shared a template'}
                          {activity.type === 'achievement_unlocked' && 'unlocked an achievement'}
                          {activity.type === 'collaboration_started' && 'started collaborating'}
                        </span>
                        <span className="font-medium text-gray-800 ml-1">{activity.metadata?.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDashboard;
