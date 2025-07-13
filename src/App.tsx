import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { UserData } from './types';


function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load saved user data on app start
  useEffect(() => {
    const savedUserData = localStorage.getItem('giteasy_user_data');
    const savedToken = localStorage.getItem('github_token');
    
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        
        // Only auto-login if we have both user data and a valid token
        if (savedToken && parsedData.username) {
          setUserData(parsedData);
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('giteasy_user_data');
        localStorage.removeItem('github_token');
      }
    }
    
    setIsInitializing(false);
  }, []);

  const handleGetStarted = (data: UserData) => {
    setUserData(data);
    setCurrentPage('dashboard');
    // Save user data to localStorage
    localStorage.setItem('giteasy_user_data', JSON.stringify(data));
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    // Don't clear user data when going back
  };

  const handleLogout = () => {
    setCurrentPage('landing');
    setUserData(null);
    // Clear all stored data on logout
    localStorage.removeItem('giteasy_user_data');
    localStorage.removeItem('github_token');
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading GitEasy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' ? (
        <LandingPage 
          onGetStarted={handleGetStarted} 
          existingUserData={userData}
          hasExistingData={!!userData}
        />
      ) : (
        <Dashboard 
          userData={userData!} 
          onBackToLanding={handleBackToLanding}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;