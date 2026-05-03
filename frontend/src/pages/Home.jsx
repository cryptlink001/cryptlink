import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { postAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 0, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      
      const response = await postAPI.getFeedPosts(pageNum, 10);
      const newPosts = response.data.content || response.data;
      
      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0, true);
  }, []);

  const handleLike = async (postId) => {
    try {
      await postAPI.likePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likesCount: post.likesCount + 1, isLiked: true }
          : post
      ));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await postAPI.unlikePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likesCount: post.likesCount - 1, isLiked: false }
          : post
      ));
    } catch (error) {
      toast.error('Failed to unlike post');
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={handleLike}
            onUnlike={handleUnlike}
          />
        ))}
        
        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="cyber-button px-6 py-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white font-medium hover:shadow-cyber-glow transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, onLike, onUnlike }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLikeClick = () => {
    if (isLiked) {
      onUnlike(post.id);
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      onLike(post.id);
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  return (
    <div className="cyber-card glass-dark rounded-2xl border border-gray-800 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
            <span className="text-white font-semibold">
              {post.user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">
              @{post.user?.username || 'unknown'}
            </h3>
            <p className="text-xs text-cyber-gray">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-cyber-gray" />
        </button>
      </div>

      {/* Post Content */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-white">{post.caption}</p>
        </div>
      )}

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="relative">
          {post.mediaType === 'image' ? (
            <img 
              src={post.mediaUrl} 
              alt={post.caption}
              className="w-full h-auto max-h-96 object-cover"
            />
          ) : post.mediaType === 'video' ? (
            <video 
              src={post.mediaUrl}
              controls
              className="w-full h-auto max-h-96 object-cover"
            />
          ) : null}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLikeClick}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-cyber-pink' : 'text-cyber-gray hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likesCount}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-cyber-gray hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.commentsCount || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-cyber-gray hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm">{post.sharesCount || 0}</span>
            </button>
          </div>
          
          <button className="text-cyber-gray hover:text-white transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Location */}
        {post.location && (
          <div className="flex items-center space-x-1 text-cyber-gray text-sm">
            <span>📍</span>
            <span>{post.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
