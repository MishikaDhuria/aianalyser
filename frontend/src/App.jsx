import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatbotAssistant from './components/ChatbotAssistant';

// Import Feature Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import GDRoom from './pages/GDRoom';
import CodingArena from './pages/CodingArena';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Navbar */}
      <Navbar />

      <div className="flex flex-1 relative min-h-[calc(100vh-73px)]">
        {/* Navigation Sidebar Panel */}
        {isAuthenticated && <Sidebar />}

        {/* Global Router Outlet */}
        <Routes>
          {/* Public Views */}
          <Route 
            path="/" 
            element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/auth" 
            element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Protected Views */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/interview-setup" 
            element={isAuthenticated ? <InterviewSetup /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/interview-room/:id" 
            element={isAuthenticated ? <InterviewRoom /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/gd-room" 
            element={isAuthenticated ? <GDRoom /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/coding-arena" 
            element={isAuthenticated ? <CodingArena /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/resume-analyzer" 
            element={isAuthenticated ? <ResumeAnalyzer /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/analytics" 
            element={isAuthenticated ? <Analytics /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/settings" 
            element={isAuthenticated ? <Settings /> : <Navigate to="/auth" replace />} 
          />

          {/* Catch-all Routing Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Floating Global Chatbot Assistant */}
      {isAuthenticated && <ChatbotAssistant />}
    </div>
  );
};

export default App;
