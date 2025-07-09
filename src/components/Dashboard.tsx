import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserData, Issue } from '../types';
import { 
  Github, 
  Bell, 
  Settings, 
  BellOff, 
  Star, 
  GitBranch, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Zap,
  Shield,
  Bug,
  RefreshCw,
  ExternalLink,
  Heart,
  Users,
  BookOpen,
  Sparkles,
  Filter,
  TrendingUp,
  Rocket,
  Cpu,
  Activity,
  LogOut,
  Plus,
  Trash2,
  Search,
  Globe,
  Code
} from 'lucide-react';
import { useGitHub, useBeginnerIssues } from '../hooks/useGitHub';
import { githubService } from '../services/github';
import RepositorySelector from './RepositorySelector';

interface DashboardProps {
  userData: UserData;
  onBackToLanding: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, onBackToLanding, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'issues' | 'discover' | 'settings'>('overview');
  const handleTabChange = (tab: 'overview' | 'repositories' | 'issues' | 'discover' | 'settings') => {
    setActiveTab(tab);
  };

  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [sortOptions, setSortOptions] = useState<{
    primary: 'updated' | 'stars' | 'created';
    secondary?: 'updated' | 'stars' | 'created';
  }>({ primary: 'updated' });
  
  // State for issue filters
  const [issueFilters, setIssueFilters] = useState({
    type: '',
    status: ''
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showAddRepos, setShowAddRepos] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState<UserData>(userData);
  
  const { user, logout } = useGitHub();
  const { issues: beginnerIssues, loading: beginnerLoading, searchIssues } = useBeginnerIssues();
  const hasInitialLoad = useRef(false);

  // Load default issues when Discover tab is first accessed
  useEffect(() => {
    if (activeTab === 'discover' && !hasInitialLoad.current) {
      searchIssues(selectedLanguage, selectedLabel, sortOptions.primary, sortOptions.secondary);
      hasInitialLoad.current = true;
    }
  }, [activeTab, searchIssues, selectedLanguage, selectedLabel, sortOptions]);

  const popularLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby'];
  const beginnerLabels = ['good first issue', 'beginner-friendly', 'documentation', 'help wanted', 'easy', 'starter'];
  
  const allIssueLabels = [
    'good first issue', 'beginner-friendly', 'documentation', 'help wanted', 
    'easy', 'starter', 'bug', 'enhancement', 'feature', 'security', 
    'performance', 'ui-ux', 'testing', 'refactoring', 'accessibility', 
    'api', 'database', 'deployment', 'hacktoberfest', 'up-for-grabs'
  ];

  // Optimized fetch function with better error handling
  const fetchAllIssues = useCallback(async () => {
    if (!userData.repositories || userData.repositories.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch issues in smaller batches to improve performance
      const batchSize = 3;
      const batches = [];
      
      for (let i = 0; i < userData.repositories.length; i += batchSize) {
        const batch = userData.repositories.slice(i, i + batchSize);
        batches.push(batch);
      }

      const allIssuesData: Issue[] = [];
      
      for (const batch of batches) {
        const batchPromises = batch.map(async (repo) => {
          try {
            const [owner, repoName] = repo.full_name.split('/');
            const githubIssues = await githubService.getRepositoryIssues(owner, repoName);
            
            return githubIssues.slice(0, 20).map(issue => ({ // Limit to 20 issues per repo
              id: issue.id,
              title: issue.title,
              type: githubService.categorizeIssue(issue),
              priority: githubService.getPriorityFromIssue(issue),
              difficulty: githubService.getDifficultyFromIssue(issue),
              status: issue.state,
              createdAt: new Date(issue.created_at).toLocaleDateString(),
              repository: repo.name,
              repositoryFullName: repo.full_name,
              url: issue.html_url,
              author: issue.user.login,
              labels: issue.labels.map(l => l.name),
              comments: issue.comments,
              assignee: issue.assignee,
            }));
          } catch (error) {
            console.warn(`Failed to fetch issues for ${repo.full_name}:`, error);
            return [];
          }
        });

        const batchResults = await Promise.all(batchPromises);
        allIssuesData.push(...batchResults.flat());
      }

      // Filter issues based on user preferences
      const filteredIssues = allIssuesData.filter(issue => 
        userData.issueTypes.includes(issue.type)
      );
      
      setAllIssues(filteredIssues);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  }, [userData.repositories, userData.issueTypes]);

  // Initial load
  useEffect(() => {
    if (updatedUserData.repositories && updatedUserData.repositories.length > 0) {
      fetchAllIssues();
      
      // Set up auto-refresh every 2 minutes
      const interval = setInterval(() => {
        fetchAllIssues();
      }, 2 * 60 * 1000); // 2 minutes
      
      return () => clearInterval(interval);
    }
  }, [fetchAllIssues, updatedUserData.repositories]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'good-first-issue': return Heart;
      case 'beginner-friendly': return Users;
      case 'documentation': return BookOpen;
      case 'help-wanted': return Sparkles;
      case 'bug': return Bug;
      case 'enhancement': return Zap;
      case 'security': return Shield;
      case 'feature': return Rocket;
      case 'performance': return Cpu;
      case 'ui-ux': return Sparkles;
      case 'testing': return CheckCircle;
      case 'refactoring': return Code;
      case 'accessibility': return Users;
      case 'api': return Globe;
      case 'database': return Activity;
      case 'deployment': return Rocket;
      default: return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const openIssues = allIssues
    .filter(issue => issue.status === 'open')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const beginnerFriendlyIssues = allIssues
    .filter(issue => 
      issue.status === 'open' && 
      ['good-first-issue', 'beginner-friendly', 'documentation'].includes(issue.type)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const notifications = beginnerFriendlyIssues.slice(0, 10);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllIssues();
    setRefreshing(false);
  };

  const handleRepositoriesChange = (repositories: any[]) => {
    const newUserData = { ...updatedUserData, repositories };
    setUpdatedUserData(newUserData);
    // Save to localStorage
    localStorage.setItem('giteasy_user_data', JSON.stringify(newUserData));
  };

  const handleRemoveRepository = (repoId: number) => {
    const newRepositories = updatedUserData.repositories?.filter(repo => repo.id !== repoId) || [];
    handleRepositoriesChange(newRepositories);
  };

  const handleDiscoverSearch = () => {
    searchIssues(selectedLanguage, selectedLabel, sortOptions.primary, sortOptions.secondary);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Repositories', value: userData.repositories?.length || 0, icon: Github, color: 'from-blue-500 to-cyan-500' },
          { label: 'Beginner Issues', value: beginnerFriendlyIssues.length, icon: Heart, color: 'from-pink-500 to-rose-500' },
          { label: 'Open Issues', value: openIssues.length, icon: AlertTriangle, color: 'from-orange-500 to-amber-500' },
          { label: 'Notifications', value: notifications.length, icon: Bell, color: 'from-purple-500 to-violet-500' }
        ].map((stat, index) => (
          <div key={index} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" 
                 style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}}></div>
            <div className="relative glass-dark rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Section */}
      <div className="flex items-center justify-between glass-dark rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-white font-medium">System Status</p>
            <p className="text-slate-400 text-sm">Last updated: {lastRefresh.toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-full border border-slate-700/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium text-sm">Auto-refresh enabled</span>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Beginner-Friendly Issues */}
      <div className="glass-dark rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Perfect for Beginners</h3>
                <p className="text-slate-400 text-sm">Curated opportunities for new contributors</p>
              </div>
            </div>
            <span className="glass-effect px-4 py-2 rounded-full text-white font-medium border border-slate-700/50">
              {beginnerFriendlyIssues.length} issues
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-slate-400">Loading issues...</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto custom-scrollbar">
            {beginnerFriendlyIssues.slice(0, 5).map((issue) => {
              const Icon = getIssueIcon(issue.type);
              return (
                <div key={issue.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-slate-600 transition-colors">
                        <Icon className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{issue.title}</h4>
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">
                          {issue.repository} • by {issue.author} • {issue.createdAt}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(issue.difficulty)}`}>
                            {issue.difficulty}
                          </span>
                          {issue.comments !== undefined && (
                            <span className="text-xs text-slate-400 flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{issue.comments} comments</span>
                            </span>
                          )}
                          {!issue.assignee && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {beginnerFriendlyIssues.length === 0 && !loading && (
              <div className="p-16 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 text-lg mb-2">No beginner-friendly issues found</p>
                <p className="text-slate-500 text-sm">Try the Discover tab to find issues across GitHub!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderDiscover = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Discover Beginner Issues</h2>
          <p className="text-slate-400">Find beginner-friendly issues across all of GitHub</p>
        </div>
        <div className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-full border border-slate-700/50">
          <Cpu className="h-5 w-5 text-blue-400" />
          <span className="text-white font-medium">AI-Powered</span>
        </div>
      </div>

      {/* Search Filters */}
      <div className="glass-dark rounded-2xl border border-slate-700/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1">
            <label className="block text-white font-semibold mb-3">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50"
            >
              <option value="">All Languages</option>
              {popularLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-white font-semibold mb-3">
              Label
            </label>
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50"
            >
              <option value="">All Labels</option>
              {allIssueLabels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-white font-semibold mb-3">
              Primary Sort
            </label>
            <select
              value={sortOptions.primary}
              onChange={(e) => setSortOptions(prev => ({ 
                ...prev, 
                primary: e.target.value as 'updated' | 'stars' | 'created',
                // Reset secondary if it's the same as primary
                secondary: prev.secondary === e.target.value ? undefined : prev.secondary
              }))}
              className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50"
            >
              <option value="updated">Most Recent</option>
              <option value="stars">Most Stars</option>
              <option value="created">Newest</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-white font-semibold mb-3">
              Secondary Sort
            </label>
            <select
              value={sortOptions.secondary || ''}
              onChange={(e) => setSortOptions(prev => ({ 
                ...prev, 
                secondary: e.target.value ? e.target.value as 'updated' | 'stars' | 'created' : undefined
              }))}
              className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50"
            >
              <option value="">None</option>
              {sortOptions.primary !== 'updated' && <option value="updated">Most Recent</option>}
              {sortOptions.primary !== 'stars' && <option value="stars">Most Stars</option>}
              {sortOptions.primary !== 'created' && <option value="created">Newest</option>}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDiscoverSearch}
              disabled={beginnerLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 font-medium transform hover:scale-105"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Discover Issues</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discovered Issues */}
      <div className="glass-dark rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-xl font-bold text-white">Discovered Issues</h3>
        </div>
        {beginnerLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-slate-400">Searching for issues...</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto custom-scrollbar">
            {beginnerIssues.map((issue) => (
              <div key={issue.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-slate-600 transition-colors">
                      <Heart className="h-5 w-5 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{issue.title}</h4>
                        <a
                          href={issue.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">
                        {issue.repository_url.split('/').slice(-2).join('/')} • by {issue.user.login} • {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-3 mb-3">
                        {(issue as any).repository_stars && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{((issue as any).repository_stars).toLocaleString()}</span>
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Updated {new Date(issue.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {issue.labels.slice(0, 3).map((label, index) => (
                            <span
                              key={index}
                              className="text-xs glass-effect text-slate-300 px-3 py-1 rounded-full border border-slate-700/50"
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{issue.comments}</span>
                    </span>
                    {!issue.assignee && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {beginnerIssues.length === 0 && !beginnerLoading && (
              <div className="p-16 text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 text-lg">Click "Discover Issues" to find beginner-friendly opportunities!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderRepositories = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Monitored Repositories</h2>
          <p className="text-slate-400 mt-2">Manage repositories you want to monitor for beginner issues</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="glass-effect px-4 py-2 rounded-full border border-slate-700/50">
            <span className="text-white font-medium">{updatedUserData.repositories?.length || 0} repositories</span>
          </div>
          <button
            onClick={() => setShowAddRepos(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Add Repositories</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {updatedUserData.repositories?.map((repo) => (
          <div key={repo.id} className="group glass-dark rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{repo.name}</h3>
                    <a
                      href={`https://github.com/${repo.full_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm">{repo.full_name}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleRemoveRepository(repo.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/20"
                    title="Remove repository"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {repo.private && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">
                      Private
                    </span>
                  )}
                  <span className="text-xs glass-effect text-slate-300 px-3 py-1 rounded-full border border-slate-700/50">
                    {repo.language || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{repo.description || 'No description'}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Star className="h-4 w-4" />
                    <span>{repo.stargazers_count?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{repo.open_issues_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {(!updatedUserData.repositories || updatedUserData.repositories.length === 0) && (
          <div className="col-span-full">
            <div className="glass-dark rounded-2xl border border-slate-700/50 p-16 text-center">
              <Github className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-bold text-white mb-2">No Repositories Added</h3>
              <p className="text-slate-400 mb-6">Add repositories to start monitoring for beginner-friendly issues</p>
              <button
                onClick={() => setShowAddRepos(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Repository</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Repositories Modal */}
      {showAddRepos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-dark rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add Repositories</h3>
              <button
                onClick={() => setShowAddRepos(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <RepositorySelector
              selectedRepositories={updatedUserData.repositories || []}
              onRepositoriesChange={handleRepositoriesChange}
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAddRepos(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium transform hover:scale-105"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Filter issues based on selected filters
  const filteredIssues = allIssues.filter(issue => {
    const typeMatch = !issueFilters.type || 
      issue.type.toLowerCase() === issueFilters.type.toLowerCase().replace(/\s+/g, '-') ||
      (issueFilters.type.toLowerCase() === 'good first issue' && issue.type === 'good-first-issue') ||
      (issueFilters.type.toLowerCase() === 'beginner friendly' && issue.type === 'beginner-friendly');
      
    const statusMatch = !issueFilters.status || 
      (issueFilters.status.toLowerCase() === 'open' && issue.status === 'open') ||
      (issueFilters.status.toLowerCase() === 'closed' && issue.status === 'closed');
      
    return typeMatch && statusMatch;
  });

  const renderIssues = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">All Issues</h2>
        <div className="flex items-center space-x-3">
          <select 
            className="glass-effect border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm bg-slate-800/50"
            value={issueFilters.type}
            onChange={(e) => setIssueFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option>Good First Issue</option>
            <option>Beginner Friendly</option>
            <option>Documentation</option>
            <option>Bug</option>
            <option>Enhancement</option>
            <option>Feature</option>
            <option>Security</option>
            <option>Performance</option>
          </select>
          <select 
            className="glass-effect border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm bg-slate-800/50"
            value={issueFilters.status}
            onChange={(e) => setIssueFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <div className="glass-dark rounded-2xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-slate-400">Loading issues...</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredIssues.map((issue) => {
              const Icon = getIssueIcon(issue.type);
              return (
                <div key={issue.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-slate-600 transition-colors">
                        <Icon className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{issue.title}</h4>
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">
                          {issue.repository} • by {issue.author} • {issue.createdAt}
                        </p>
                        {issue.labels && issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {issue.labels.slice(0, 3).map((label, index) => (
                              <span
                                key={index}
                                className="text-xs glass-effect text-slate-300 px-3 py-1 rounded-full border border-slate-700/50"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(issue.difficulty)}`}>
                        {issue.difficulty}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        issue.status === 'open' ? 'text-green-400 bg-green-500/20 border border-green-500/30' : 'text-slate-400 bg-slate-500/20 border border-slate-500/30'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredIssues.length === 0 && !loading && (
              <div className="p-16 text-center">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 text-lg">
                  {allIssues.length === 0 
                    ? 'No issues found in your repositories.' 
                    : 'No issues match your current filters.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Settings</h2>
      
        <div className="space-y-8">
          {/* Auto-Refresh Status */}
          <div className="glass-dark rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Auto-Refresh Status</h3>
                  <p className="text-slate-400 text-sm">Issues are automatically updated every 2 minutes • Session persists across browser restarts</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{updatedUserData.issueTypes.length}</div>
                  <div className="text-slate-400">Issue Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{updatedUserData.repositories?.length || 0}</div>
                  <div className="text-slate-400">Repositories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{openIssues.length}</div>
                  <div className="text-slate-400">Open Issues</div>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* User Settings */}
          <div className="glass-dark rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">User Settings</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">Username</label>
                <input 
                  type="text" 
                  value={updatedUserData.username} 
                  disabled 
                  className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-slate-400 bg-slate-800/50"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">GitHub Username</label>
                <input 
                  type="text" 
                  value={updatedUserData.githubUsername || user?.login || ''} 
                  disabled 
                  className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-slate-400 bg-slate-800/50"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium transform hover:scale-105 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect GitHub</span>
                </button>
              </div>
            </div>
          </div>

          {/* Issue Types */}
          <div className="glass-dark rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Issue Types</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {updatedUserData.issueTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-3 p-4 glass-effect rounded-xl border border-slate-700/50">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white font-medium capitalize">{type.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full mix-blend-multiply filter blur-xl floating"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full mix-blend-multiply filter blur-xl floating-delayed"></div>
        <div className="absolute inset-0 grid-bg opacity-20"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="glass-dark border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={onBackToLanding}
                  className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Back</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
                    <div className="relative bg-slate-900 p-2 rounded-xl border border-slate-700">
                      <Github className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      GitEasy
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white px-3 py-1 rounded-full font-medium">
                        for Beginners
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-slate-400" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 glass-effect px-4 py-2 rounded-full border border-slate-700/50">
                  <span className="text-white font-medium">{updatedUserData.username}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="glass-dark border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'discover', label: 'Discover', icon: TrendingUp },
                { id: 'repositories', label: 'Repositories', icon: Github },
                { id: 'issues', label: 'Issues', icon: AlertTriangle },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'discover' && renderDiscover()}
          {activeTab === 'repositories' && renderRepositories()}
          {activeTab === 'issues' && renderIssues()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;