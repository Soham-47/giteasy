import React, { useState } from 'react';
import { Github, Bell, Zap, Shield, Bug, Star, ArrowRight, Heart, Users, BookOpen, Code, Sparkles, Rocket, Globe, Cpu, CheckCircle, Activity } from 'lucide-react';
import { UserData } from '../types';
import { useGitHub } from '../hooks/useGitHub';
import GitHubAuth from './GitHubAuth';
import RepositorySelector from './RepositorySelector';

interface LandingPageProps {
  onGetStarted: (data: UserData) => void;
  existingUserData?: UserData | null;
  hasExistingData?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, existingUserData, hasExistingData }) => {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<'auth' | 'setup'>('auth');
  const [formData, setFormData] = useState({
    username: existingUserData?.username || '',
    issueTypes: existingUserData?.issueTypes || [],
    repositories: existingUserData?.repositories || [],
  });

  const { isAuthenticated, user } = useGitHub();

  const issueTypeOptions = [
    { id: 'good-first-issue', label: 'Good First Issues', icon: Heart, description: 'Perfect for newcomers to open source' },
    { id: 'beginner-friendly', label: 'Beginner Friendly', icon: Users, description: 'Issues suitable for new contributors' },
    { id: 'documentation', label: 'Documentation', icon: BookOpen, description: 'Help improve project documentation' },
    { id: 'help-wanted', label: 'Help Wanted', icon: Sparkles, description: 'Projects actively seeking contributors' },
    { id: 'bug', label: 'Bug Reports', icon: Bug, description: 'Fix bugs and improve stability' },
    { id: 'enhancement', label: 'Enhancements', icon: Zap, description: 'Add new features and improvements' },
    { id: 'feature', label: 'Feature Requests', icon: Rocket, description: 'Implement new features and functionality' },
    { id: 'security', label: 'Security Issues', icon: Shield, description: 'Address security vulnerabilities' },
    { id: 'performance', label: 'Performance', icon: Cpu, description: 'Optimize performance and speed' },
    { id: 'ui-ux', label: 'UI/UX', icon: Sparkles, description: 'Improve user interface and experience' },
    { id: 'testing', label: 'Testing', icon: CheckCircle, description: 'Add or improve tests' },
    { id: 'refactoring', label: 'Refactoring', icon: Code, description: 'Code cleanup and restructuring' },
    { id: 'accessibility', label: 'Accessibility', icon: Users, description: 'Improve accessibility features' },
    { id: 'api', label: 'API', icon: Globe, description: 'API-related improvements' },
    { id: 'database', label: 'Database', icon: Activity, description: 'Database-related issues' },
    { id: 'deployment', label: 'Deployment', icon: Rocket, description: 'Deployment and DevOps issues' }
  ];

  const handleIssueTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      issueTypes: prev.issueTypes.includes(type)
        ? prev.issueTypes.filter(t => t !== type)
        : [...prev.issueTypes, type]
    }));
  };

  const handleAuthSuccess = () => {
    setCurrentStep('setup');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username && formData.issueTypes.length > 0 && formData.repositories.length > 0) {
      onGetStarted({
        username: formData.username,
        githubUsername: user?.login,
        issueTypes: formData.issueTypes,
        repositories: formData.repositories,
        notificationPreferences: {
          instant: true,
          daily: false,
          weekly: false,
        },
      });
    }
  };

  // If user has existing data, show "Go to Dashboard" instead of "Get Started"
  const handleMainAction = () => {
    if (hasExistingData && existingUserData) {
      onGetStarted(existingUserData);
    } else {
      setShowForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl floating"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl floating-delayed"></div>
        <div className="absolute -bottom-32 left-40 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl floating"></div>
        
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <Github className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GitEasy
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white px-3 py-1 rounded-full font-medium">
                    for Beginners
                  </span>
                  <Rocket className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            </div>
            <button 
              onClick={handleMainAction}
              className="group relative btn-primary bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 pulse-glow"
            >
              <span className="relative z-10">
                {hasExistingData ? 'Go to Dashboard' : 'Get Started'}
              </span>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-6 py-3 mb-8">
                <Cpu className="h-5 w-5 text-blue-400" />
                <span className="text-slate-300 font-medium">AI-Powered Issue Discovery</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
                Your First
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Open Source
                </span>
                <span className="block">Journey Starts Here</span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
                Discover beginner-friendly GitHub issues with AI-powered matching. 
                Get instant notifications for good first issues, documentation tasks, and help-wanted projects 
                across thousands of repositories.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={handleMainAction}
                  className="group relative btn-primary bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 pulse-glow"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Rocket className="h-6 w-6" />
                    <span>{hasExistingData ? 'Go to Dashboard' : 'Launch Your Journey'}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button className="group glass-effect text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center space-x-2">
                    <Globe className="h-6 w-6" />
                    <span>Explore Demo</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  icon: Heart,
                  title: 'Good First Issues',
                  description: 'Curated beginner-friendly issues from popular open source projects, perfect for your first contribution.',
                  gradient: 'from-pink-500 to-rose-500'
                },
                {
                  icon: BookOpen,
                  title: 'Documentation Tasks',
                  description: 'Start with documentation improvements - fix typos, add examples, or clarify instructions.',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Users,
                  title: 'Mentored Projects',
                  description: 'Find projects with active maintainers who welcome and guide new contributors.',
                  gradient: 'from-purple-500 to-violet-500'
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" 
                       style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}}></div>
                  <div className="relative glass-effect rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-slate-700/50">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Popular Languages Section */}
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-white mb-8">
                Find Issues in Your 
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Favorite Language</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {['JavaScript', 'Python', 'Java', 'TypeScript', 'Go', 'Rust', 'C++', 'PHP'].map((lang) => (
                  <div
                    key={lang}
                    className="group glass-effect border border-slate-700/50 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    <span className="font-medium">{lang}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {[
                { number: '10K+', label: 'Good First Issues', icon: Heart },
                { number: '500+', label: 'Beginner Projects', icon: Rocket },
                { number: '50+', label: 'Programming Languages', icon: Code },
                { number: '24/7', label: 'Issue Monitoring', icon: Zap }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="glass-effect rounded-2xl p-6 border border-slate-700/50 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                    <div className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-slate-300 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Setup Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-dark rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50">
              {!isAuthenticated && currentStep === 'auth' ? (
                <GitHubAuth onAuthenticated={handleAuthSuccess} />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-2">Setup Your Journey</h2>
                      <p className="text-slate-300">Configure your preferences to get started</p>
                    </div>
                    <div className="flex items-center space-x-3 glass-effect px-4 py-2 rounded-full border border-slate-700/50">
                      <Github className="h-5 w-5 text-green-400" />
                      <span className="text-white font-medium">{user?.login}</span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-6 py-4 glass-effect border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="your_username"
                        required
                      />
                      <p className="text-slate-400 text-sm mt-2">
                        Choose a unique username for your GitEasy account.
                      </p>
                    </div>

                    <RepositorySelector
                      selectedRepositories={formData.repositories}
                      onRepositoriesChange={(repositories) => 
                        setFormData(prev => ({ ...prev, repositories }))
                      }
                    />

                    <div>
                      <label className="block text-lg font-semibold text-white mb-4">
                        Types of Issues to Monitor *
                      </label>
                      <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {issueTypeOptions.map(({ id, label, icon: Icon, description }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => handleIssueTypeToggle(id)}
                              className={`flex items-start space-x-4 p-6 rounded-xl border-2 transition-all text-left transform hover:scale-105 ${
                                formData.issueTypes.includes(id)
                                  ? 'border-blue-500 bg-blue-500/20 text-white'
                                  : 'border-slate-700/50 glass-effect hover:border-slate-600 text-slate-300'
                              }`}
                            >
                              <Icon className="h-7 w-7 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-lg">{label}</div>
                                <div className="text-sm opacity-80 mt-1">{description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass-effect p-6 rounded-xl border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <Bell className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Browser Notifications</h3>
                      </div>
                      <p className="text-slate-300 mb-4">
                        Get instant desktop notifications when new beginner-friendly issues are found in your monitored repositories.
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Real-time notifications</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>No email spam - browser only</span>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={!formData.username || formData.issueTypes.length === 0 || formData.repositories.length === 0}
                        className="flex-1 btn-primary bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <Rocket className="h-6 w-6" />
                          <span>Start Your Journey</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-8 py-4 glass-effect border border-slate-700/50 rounded-xl text-white hover:bg-white/10 transition-all font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;