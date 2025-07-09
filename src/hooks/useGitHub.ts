import { useState, useEffect, useCallback } from 'react';
import { githubService, GitHubUser, GitHubRepository, GitHubIssue } from '../services/github';

export const useGitHub = () => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = githubService.getToken();
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const userData = await githubService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setIsAuthenticated(false);
      githubService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (token: string) => {
    githubService.setToken(token);
    await fetchCurrentUser();
  }, []);

  const logout = useCallback(() => {
    githubService.clearToken();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refetch: fetchCurrentUser,
  };
};

export const useRepositories = (username?: string) => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await githubService.getUserRepositories(username);
      setRepositories(repos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return {
    repositories,
    loading,
    error,
    refetch: fetchRepositories,
  };
};

export const useBeginnerRepositories = () => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBeginnerRepos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await githubService.getBeginnerFriendlyRepos();
      setRepositories(repos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch beginner repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBeginnerRepos();
  }, [fetchBeginnerRepos]);

  return {
    repositories,
    loading,
    error,
    refetch: fetchBeginnerRepos,
  };
};

export const useIssues = (owner: string, repo: string, enabled = true) => {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    if (!enabled || !owner || !repo) return;
    
    try {
      setLoading(true);
      setError(null);
      const issueData = await githubService.getRepositoryIssues(owner, repo);
      setIssues(issueData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  }, [owner, repo, enabled]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
  };
};

export const useBeginnerIssues = () => {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchIssues = useCallback(async (
    language?: string, 
    label?: string, 
    primarySort: 'updated' | 'stars' | 'created' = 'updated',
    secondarySort?: 'updated' | 'stars' | 'created'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await githubService.searchBeginnerIssues(language, label, primarySort, secondarySort);
      setIssues(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search beginner issues');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    issues,
    loading,
    error,
    searchIssues,
  };
};

export const useRepositorySearch = () => {
  const [results, setResults] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    query: string, 
    primarySort: 'stars' | 'updated' | 'forks' = 'stars',
    secondarySort?: 'stars' | 'updated' | 'forks'
  ) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await githubService.searchRepositories(query, primarySort, secondarySort);
      setResults(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchBeginnerRepos = useCallback(async (
    language?: string, 
    primarySort: 'stars' | 'updated' | 'forks' = 'stars',
    secondarySort?: 'stars' | 'updated' | 'forks'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await githubService.searchBeginnerRepos(language, primarySort, secondarySort);
      setResults(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search,
    searchBeginnerRepos,
  };
};