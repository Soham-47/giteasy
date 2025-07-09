import React, { useState } from 'react';
import { Github, Key, AlertCircle, CheckCircle, Rocket, Shield } from 'lucide-react';
import { useGitHub } from '../hooks/useGitHub';

interface GitHubAuthProps {
  onAuthenticated: () => void;
}

const GitHubAuth: React.FC<GitHubAuthProps> = ({ onAuthenticated }) => {
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const { login, loading, error } = useGitHub();

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      try {
        await login(token.trim());
        onAuthenticated();
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  return (
    <div className="glass-dark rounded-3xl p-8 max-w-md w-full border border-slate-700/50">
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75"></div>
          <div className="relative bg-slate-900 p-4 rounded-2xl border border-slate-700 inline-block">
            <Github className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Connect to GitHub</h2>
        <p className="text-slate-300 leading-relaxed">
          Connect your GitHub account to monitor repositories and receive issue notifications.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {!showTokenInput ? (
        <div className="space-y-6">
          <button
            onClick={() => setShowTokenInput(true)}
            className="w-full btn-primary bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 font-semibold transform hover:scale-105"
          >
            <Key className="h-5 w-5" />
            <span>Use Personal Access Token</span>
          </button>
          
          <div className="text-center">
            <p className="text-slate-400 mb-3">Need a token?</p>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo,user:email&description=GitEasy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <Rocket className="h-4 w-4" />
              <span>Create one on GitHub →</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleTokenSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">
              Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 glass-effect border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-slate-400 text-xs mt-2 flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Your token is stored locally and never sent to our servers.</span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="flex-1 btn-primary bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold transform hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Connect</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowTokenInput(false)}
              className="px-6 py-3 glass-effect border border-slate-700/50 rounded-xl text-white hover:bg-white/10 transition-all duration-300 font-semibold"
            >
              Back
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 glass-effect p-4 rounded-xl border border-slate-700/50">
        <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <span>Required Permissions:</span>
        </h4>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Read repository information</li>
          <li>• Access issues and pull requests</li>
          <li>• Read user profile information</li>
        </ul>
      </div>
    </div>
  );
};

export default GitHubAuth;