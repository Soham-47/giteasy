import React, { useState, useEffect } from 'react';
import { Search, Github, Star, AlertTriangle, Plus, Check, Users, BookOpen, Zap, Heart, Loader } from 'lucide-react';
import { useRepositories, useRepositorySearch, useBeginnerRepositories } from '../hooks/useGitHub';
import { githubService } from '../services/github';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  open_issues_count: number;
  language: string;
  private: boolean;
  topics?: string[];
}

interface RepositorySelectorProps {
  selectedRepositories: Repository[];
  onRepositoriesChange: (repositories: Repository[]) => void;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  selectedRepositories,
  onRepositoriesChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'owned' | 'beginner' | 'search' | 'custom'>('beginner');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [addingCustomRepo, setAddingCustomRepo] = useState(false);
  
  const { repositories: ownedRepos, loading: ownedLoading } = useRepositories();
  const { repositories: beginnerRepos, loading: beginnerLoading } = useBeginnerRepositories();
  const { results: searchResults, loading: searchLoading, search, searchBeginnerRepos } = useRepositorySearch();

  const popularLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 
    'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS'
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        search(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, search]);

  useEffect(() => {
    if (activeTab === 'beginner' && selectedLanguage) {
      searchBeginnerRepos(selectedLanguage);
    }
  }, [selectedLanguage, activeTab, searchBeginnerRepos]);

  const handleRepositoryToggle = (repo: Repository) => {
    const isSelected = selectedRepositories.some(r => r.id === repo.id);
    if (isSelected) {
      onRepositoriesChange(selectedRepositories.filter(r => r.id !== repo.id));
    } else {
      onRepositoriesChange([...selectedRepositories, repo]);
    }
  };

  const handleCustomRepoAdd = async () => {
    const parsed = githubService.parseRepositoryUrl(customRepoUrl);
    if (!parsed) {
      return;
    }

    setAddingCustomRepo(true);
    try {
      const repo = await githubService.getRepository(parsed.owner, parsed.repo);
      const mappedRepo: Repository = {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || '',
        stargazers_count: repo.stargazers_count,
        open_issues_count: repo.open_issues_count,
        language: repo.language || 'Unknown',
        private: repo.private,
        topics: repo.topics,
      };
      
      if (!selectedRepositories.some(r => r.id === mappedRepo.id)) {
        onRepositoriesChange([...selectedRepositories, mappedRepo]);
      }
      setCustomRepoUrl('');
    } catch (error) {
      console.error('Failed to fetch repository:', error);
    } finally {
      setAddingCustomRepo(false);
    }
  };

  const getRepositoryBadges = (repo: Repository) => {
    const badges = [];
    
    if (repo.topics) {
      if (repo.topics.includes('good-first-issue')) {
        badges.push({ text: 'Good First Issue', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Heart });
      }
      if (repo.topics.includes('beginner-friendly')) {
        badges.push({ text: 'Beginner Friendly', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Users });
      }
      if (repo.topics.includes('hacktoberfest')) {
        badges.push({ text: 'Hacktoberfest', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Zap });
      }
      if (repo.topics.includes('documentation')) {
        badges.push({ text: 'Docs', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: BookOpen });
      }
    }
    
    return badges;
  };

  const renderRepository = (repo: Repository) => {
    const isSelected = selectedRepositories.some(r => r.id === repo.id);
    const badges = getRepositoryBadges(repo);
    
    return (
      <div
        key={repo.id}
        className={`w-full p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
          isSelected
            ? 'border-2 border-blue-500 bg-blue-500/20 shadow-lg'
            : 'border border-slate-700/50 glass-effect hover:border-slate-600 hover:bg-white/5'
        }`}
        onClick={() => handleRepositoryToggle(repo)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Github className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-white">{repo.name}</span>
              {repo.private && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                  Private
                </span>
              )}
              {repo.language && (
                <span className="text-xs glass-effect text-slate-300 px-2 py-1 rounded-full border border-slate-700/50">
                  {repo.language}
                </span>
              )}
            </div>
            
            {/* Beginner-friendly badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {badges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <span
                      key={index}
                      className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full border ${badge.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{badge.text}</span>
                    </span>
                  );
                })}
              </div>
            )}
            
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{repo.description || 'No description'}</p>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>{repo.stargazers_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{repo.open_issues_count} issues</span>
              </div>
            </div>
          </div>
          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
          }`}>
            {isSelected && <Check className="h-4 w-4 text-white" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Select Repositories to Monitor</h3>
        <p className="text-slate-400 mb-6">
          Choose repositories to monitor for beginner-friendly issues and contribution opportunities.
        </p>
        
        {/* Tabs */}
        <div className="flex space-x-1 glass-effect p-1 rounded-xl mb-6 border border-slate-700/50">
          {[
            { id: 'beginner', label: 'Beginner Friendly', icon: Heart },
            { id: 'owned', label: 'Your Repositories', icon: Github },
            { id: 'search', label: 'Search Public', icon: Search },
            { id: 'custom', label: 'Add by URL', icon: Plus }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected repositories summary */}
      {selectedRepositories.length > 0 && (
        <div className="glass-effect border border-blue-500/30 rounded-xl p-4">
          <h4 className="font-semibold text-white mb-3">
            Selected Repositories ({selectedRepositories.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedRepositories.map(repo => (
              <span
                key={repo.id}
                className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30"
              >
                <span>{repo.name}</span>
                <button
                  onClick={() => handleRepositoryToggle(repo)}
                  className="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
                >
                  <Plus className="h-3 w-3 rotate-45" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'beginner' && (
          <div>
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">
                Filter by Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Languages</option>
                {popularLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            
            {beginnerLoading || searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="text-slate-400">Loading beginner-friendly repositories...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {(selectedLanguage ? searchResults : beginnerRepos).map(renderRepository)}
                {(selectedLanguage ? searchResults : beginnerRepos).length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 text-lg">No beginner-friendly repositories found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'owned' && (
          <div>
            {ownedLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="text-slate-400">Loading your repositories...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {ownedRepos.map(renderRepository)}
                {ownedRepos.length === 0 && (
                  <div className="text-center py-12">
                    <Github className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 text-lg">No repositories found in your account.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search public repositories..."
                className="w-full pl-12 pr-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="text-slate-400">Searching repositories...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {searchResults.map(renderRepository)}
                {searchResults.length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 text-lg">No repositories found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div>
            <div className="flex space-x-3 mb-6">
              <input
                type="url"
                value={customRepoUrl}
                onChange={(e) => setCustomRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="flex-1 px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCustomRepoAdd}
                disabled={!customRepoUrl.trim() || addingCustomRepo}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105 flex items-center space-x-2"
              >
                {addingCustomRepo ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>Add</span>
              </button>
            </div>
            <div className="glass-effect p-4 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-sm">
                Enter the full GitHub repository URL to add it to your monitoring list.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositorySelector;