import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, MapPin, Hash } from 'lucide-react';
import { userAPI, postAPI, reelAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingReels, setTrendingReels] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTrendingPosts = async () => {
    try {
      const response = await postAPI.getTrendingPosts(0, 20);
      setTrendingPosts(response.data.content || response.data);
    } catch (error) {
      toast.error('Failed to load trending posts');
    }
  };

  const fetchTrendingReels = async () => {
    try {
      const response = await reelAPI.getTrendingReels(0, 20);
      setTrendingReels(response.data.content || response.data);
    } catch (error) {
      toast.error('Failed to load trending reels');
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await userAPI.getOnlineUsers(0, 20);
      setOnlineUsers(response.data.content || response.data);
    } catch (error) {
      console.error('Failed to fetch online users');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const [usersResponse, postsResponse, reelsResponse] = await Promise.all([
        userAPI.searchUsers(searchQuery, 0, 10),
        postAPI.searchPosts(searchQuery, 0, 10),
        reelAPI.searchReels(searchQuery, 0, 10)
      ]);

      setSearchResults({
        users: usersResponse.data.content || usersResponse.data,
        posts: postsResponse.data.content || postsResponse.data,
        reels: reelsResponse.data.content || reelsResponse.data
      });
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
    fetchTrendingReels();
    fetchOnlineUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(handleSearch, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Search Header */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyber-gray w-5 h-5" />
          <input
            type="text"
            placeholder="Search users, posts, reels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cyber-input w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-400 text-lg"
            autoFocus
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-800">
        {[
          { id: 'search', label: 'Search', icon: Search },
          { id: 'trending', label: 'Trending', icon: TrendingUp },
          { id: 'online', label: 'Online', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyber-purple text-cyber-purple'
                  : 'border-transparent text-cyber-gray hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-screen">
        {activeTab === 'search' && (
          <SearchResults 
            results={searchResults} 
            loading={loading}
            onUserClick={handleUserClick}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'trending' && (
          <TrendingContent 
            posts={trendingPosts}
            reels={trendingReels}
            onUserClick={handleUserClick}
          />
        )}

        {activeTab === 'online' && (
          <OnlineUsers 
            users={onlineUsers}
            onUserClick={handleUserClick}
          />
        )}
      </div>
    </div>
  );
};

const SearchResults = ({ results, loading, onUserClick, searchQuery }) => {
  if (!searchQuery.trim()) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto text-cyber-gray mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Start Exploring</h3>
        <p className="text-cyber-gray">Search for users, posts, or reels</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Users Section */}
      {results.users?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Users
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.users.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onClick={() => onUserClick(user.username)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      {results.posts?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Posts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Reels Section */}
      {results.reels?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Reels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.reels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {Object.values(results).every(arr => arr?.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">No Results</h3>
          <p className="text-cyber-gray">Try searching for something else</p>
        </div>
      )}
    </div>
  );
};

const TrendingContent = ({ posts, reels, onUserClick }) => (
  <div className="space-y-8">
    {/* Trending Posts */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Trending Posts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>

    {/* Trending Reels */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Trending Reels
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  </div>
);

const OnlineUsers = ({ users, onUserClick }) => (
  <div>
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
      <Users className="w-5 h-5 mr-2" />
      Online Now
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={() => onUserClick(user.username)} 
          showOnlineStatus
        />
      ))}
    </div>
  </div>
);

const UserCard = ({ user, onClick, showOnlineStatus = false }) => (
  <div 
    onClick={onClick}
    className="glass-dark rounded-xl p-4 border border-gray-800 hover:border-cyber-purple transition-all duration-300 cursor-pointer hover:shadow-cyber-glow"
  >
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
          <span className="text-white font-semibold">
            {user.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        {(showOnlineStatus || user.isOnline) && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-cyber-green rounded-full border-2 border-cyber-black"></div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white">@{user.username}</h4>
        {user.displayName && (
          <p className="text-sm text-cyber-gray">{user.displayName}</p>
        )}
        {user.bio && (
          <p className="text-xs text-cyber-gray mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </div>
  </div>
);

const PostCard = ({ post }) => (
  <div className="cyber-card glass-dark rounded-xl border border-gray-800 overflow-hidden hover:border-cyber-purple transition-all duration-300">
    {post.mediaUrl && (
      <div className="aspect-video">
        {post.mediaType === 'image' ? (
          <img 
            src={post.mediaUrl} 
            alt={post.caption}
            className="w-full h-full object-cover"
          />
        ) : (
          <video 
            src={post.mediaUrl}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    )}
    <div className="p-4">
      <p className="text-white text-sm line-clamp-2">{post.caption}</p>
      <div className="flex items-center justify-between mt-3 text-xs text-cyber-gray">
        <span>❤️ {post.likesCount || 0}</span>
        <span>💬 {post.commentsCount || 0}</span>
      </div>
    </div>
  </div>
);

const ReelCard = ({ reel }) => (
  <div className="cyber-card glass-dark rounded-xl border border-gray-800 overflow-hidden hover:border-cyber-purple transition-all duration-300 relative group">
    <div className="aspect-[9/16]">
      <video 
        src={reel.videoUrl}
        className="w-full h-full object-cover"
        poster={reel.thumbnailUrl}
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
      <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
      <div className="flex items-center justify-between mt-2 text-xs text-white">
        <span>❤️ {reel.likesCount || 0}</span>
        <span>👁️ {reel.viewsCount || 0}</span>
      </div>
    </div>
  </div>
);

export default Explore;
