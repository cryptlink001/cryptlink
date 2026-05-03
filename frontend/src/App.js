import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Reels from './pages/Reels';
import Chat from './pages/Chat';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Hooks
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-cyber-black text-white">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(8px)',
            },
          }}
        />
        
        {!isAuthenticated ? (
          <div className="flex items-center justify-center min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        ) : (
          <div className="flex flex-col h-screen">
            <Navbar />
            <main className="flex-1 overflow-y-auto hide-scrollbar pb-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/reels" element={<Reels />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
