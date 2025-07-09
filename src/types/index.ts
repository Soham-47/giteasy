export interface UserData {
  username: string;
  githubUsername?: string;
  repositoryUrl?: string;
  issueTypes: string[];
  repositories?: Repository[];
  notificationPreferences: {
    instant: boolean;
    daily: boolean;
    weekly: boolean;
  };
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  open_issues_count: number;
  language: string;
  private: boolean;
  topics?: string[];
  owner?: {
    login: string;
    avatar_url: string;
  };
}

export interface Issue {
  id: number;
  title: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status: 'open' | 'closed';
  createdAt: string;
  repository: string;
  repositoryFullName?: string;
  url?: string;
  author?: string;
  labels?: string[];
  comments?: number;
  assignee?: any;
}