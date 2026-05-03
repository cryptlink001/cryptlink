import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, Settings, Grid, Video, User as UserIcon, FollowButton } from 'lucide-react';
import { userAPI, postAPI, reelAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getUserByUsername(username);
      setProfileUser(response.data);
    } catch (error) {
      toast.error('User not found');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await postAPI.getUserPosts(profileUser.id, 0, 20);
      setPosts(response.data.content || response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    }
  };

  const fetchUserReels = async () => {
    try {
      const response = await reelAPI.getUserReels(profileUser.id, 0, 20);
      setReels(response.data.content || response.data);
    } catch (error) {
      toast.error('Failed to load reels');
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const [followersResponse, followingResponse] = await Promise.all([
        userAPI.getFollowers(profileUser.id, 0, 0),
        userAPI.getFollowing(profileUser.id, 0, 0)
      ]);
      setFollowersCount(followersResponse.data.totalElements || 0);
      setFollowingCount(followingResponse.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch follow counts');
    }
  };

  const checkFollowingStatus = async () => {
    if (currentUser && profileUser) {
      try {
        const response = await userAPI.isFollowing(currentUser.id, profileUser.id);
        setIsFollowing(response.data);
      } catch (error) {
        console.error('Failed to check following status');
      }
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      if (isFollowing) {
        await userAPI.unfollowUser(currentUser.id, profileUser.id);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast.success('Unfollowed successfully');
      } else {
        await userAPI.followUser(currentUser.id, profileUser.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Followed successfully');
      }
    } catch (error) {
      toast.error('Failed to follow/unfollow');
    }
  };

  useEffect(() => {
    if (username) {
      setLoading(true);
      fetchUserProfile();
    }
  }, [username]);

  useEffect(() => {
    if (profileUser) {
      Promise.all([
        fetchUserPosts(),
        fetchUserReels(),
        fetchFollowCounts(),
        checkFollowingStatus()
      ]).finally(() => setLoading(false));
    }
  }, [profileUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-cyber-gray">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="glass-dark rounded-2xl border border-gray-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
              {profileUser.profilePictureUrl ? (
                <img 
                  src={profileUser.profilePictureUrl} 
                  alt={profileUser.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {profileUser.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {profileUser.isOnline && !profileUser.hideOnlineStatus && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-cyber-green rounded-full border-3 border-cyber-black"></div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  @{profileUser.username}
                </h1>
                {profileUser.displayName && (
                  <p className="text-lg text-cyber-gray mb-2">{profileUser.displayName}</p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                {isOwnProfile ? (
                  <button className="cyber-button px-4 py-2 rounded-lg border border-cyber-purple text-cyber-purple font-medium hover:bg-cyber-purple/10 transition-colors">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`cyber-button px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isFollowing
                        ? 'border border-gray-600 text-gray-400 hover:border-white hover:text-white'
                        : 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white hover:shadow-cyber-glow'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{posts.length + reels.length}</p>
                <p className="text-sm text-cyber-gray">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{followersCount}</p>
                <p className="text-sm text-cyber-gray">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{followingCount}</p>
                <p className="text-sm text-cyber-gray">Following</p>
              </div>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <p className="text-white mb-4">{profileUser.bio}</p>
            )}

            {/* Verification Badge */}
            {profileUser.isVerified && (
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <div className="w-5 h-5 bg-cyber-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-cyber-blue text-sm">Verified Account</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="glass-dark rounded-2xl border border-gray-800">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-cyber-purple text-cyber-purple'
                : 'border-transparent text-cyber-gray hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'reels'
                ? 'border-cyber-purple text-cyber-purple'
                : 'border-transparent text-cyber-gray hover:text-white'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Reels</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-cyber-purple text-cyber-purple'
                : 'border-transparent text-cyber-gray hover:text-white'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span>Saved</span>
          </button>
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'tagged'
                ? 'border-cyber-purple text-cyber-purple'
                : 'border-transparent text-cyber-gray hover:text-white'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Tagged</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'posts' && (
            <PostsGrid posts={posts} />
          )}
          {activeTab === 'reels' && (
            <ReelsGrid reels={reels} />
          )}
          {activeTab === 'saved' && (
            <SavedSection />
          )}
          {activeTab === 'tagged' && (
            <TaggedSection />
          )}
        </div>
      </div>
    </div>
  );
};

const PostsGrid = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid className="w-16 h-16 mx-auto text-cyber-gray mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
        <p className="text-cyber-gray">When you post, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div key={post.id} className="aspect-square relative group">
          {post.mediaUrl ? (
            post.mediaType === 'image' ? (
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
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyber-purple/20 to-cyber-blue/20 flex items-center justify-center">
              <span className="text-cyber-gray">No media</span>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1 text-white">
              <Heart className="w-5 h-5" />
              <span>{post.likesCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-white">
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ReelsGrid = ({ reels }) => {
  if (reels.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="w-16 h-16 mx-auto text-cyber-gray mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Reels Yet</h3>
        <p className="text-cyber-gray">When you create reels, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {reels.map((reel) => (
        <div key={reel.id} className="aspect-[9/16] relative group">
          <video 
            src={reel.videoUrl}
            poster={reel.thumbnailUrl}
            className="w-full h-full object-cover"
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
            </div>
          </div>
          
          {/* Views Count */}
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-xs">
            <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent"></div>
            <span>{reel.viewsCount || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const SavedSection = () => (
  <div className="text-center py-12">
    <Bookmark className="w-16 h-16 mx-auto text-cyber-gray mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">Saved Posts</h3>
    <p className="text-cyber-gray">Posts you save will appear here.</p>
  </div>
);

const TaggedSection = () => (
  <div className="text-center py-12">
    <UserIcon className="w-16 h-16 mx-auto text-cyber-gray mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">Tagged Posts</h3>
    <p className="text-cyber-gray">Posts you're tagged in will appear here.</p>
  </div>
);

export default Profile;
