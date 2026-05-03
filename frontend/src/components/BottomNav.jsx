import React from 'react';
import { Home, Video, MessageSquare, Search, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/reels', icon: Video, label: 'Reels' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/explore', icon: Search, label: 'Explore' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-cyber-purple'
                    : 'text-cyber-gray hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'neon-glow' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
