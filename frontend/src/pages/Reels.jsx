import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { reelAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef([]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await reelAPI.getFeedReels(0, 20);
      setReels(response.data.content || response.data);
    } catch (error) {
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    // Auto-play current video
    if (videoRefs.current[currentIndex]) {
      const currentVideo = videoRefs.current[currentIndex];
      currentVideo.play().catch(() => {
        // Handle autoplay policy
      });
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (index !== currentIndex && video) {
        video.pause();
      }
    });
  }, [currentIndex]);

  const handleVideoClick = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleLike = async (reelId) => {
    try {
      await reelAPI.likeReel(reelId);
      setReels(prev => prev.map(reel => 
        reel.id === reelId 
          ? { ...reel, likesCount: reel.likesCount + 1, isLiked: true }
          : reel
      ));
    } catch (error) {
      toast.error('Failed to like reel');
    }
  };

  const handleUnlike = async (reelId) => {
    try {
      await reelAPI.unlikeReel(reelId);
      setReels(prev => prev.map(reel => 
        reel.id === reelId 
          ? { ...reel, likesCount: reel.likesCount - 1, isLiked: false }
          : reel
      ));
    } catch (error) {
      toast.error('Failed to unlike reel');
    }
  };

  const handleView = async (reelId) => {
    try {
      await reelAPI.viewReel(reelId);
    } catch (error) {
      // Silently fail for views
    }
  };

  const scrollToReel = (index) => {
    setCurrentIndex(index);
    const element = document.getElementById(`reel-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollTop;
    const windowHeight = window.innerHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
      handleView(reels[newIndex].id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-scroll scroll-smooth" onScroll={handleScroll}>
        {reels.map((reel, index) => (
          <ReelCard
            key={reel.id}
            id={`reel-${index}`}
            reel={reel}
            isActive={index === currentIndex}
            videoRef={(el) => (videoRefs.current[index] = el)}
            onVideoClick={() => handleVideoClick(index)}
            onLike={() => handleLike(reel.id)}
            onUnlike={() => handleUnlike(reel.id)}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted(!isMuted)}
          />
        ))}
      </div>
    </div>
  );
};

const ReelCard = ({ 
  id, 
  reel, 
  isActive, 
  videoRef, 
  onVideoClick, 
  onLike, 
  onUnlike, 
  isMuted, 
  onMuteToggle 
}) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLikeClick = () => {
    if (isLiked) {
      onUnlike();
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      onLike();
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);

  return (
    <div 
      id={id}
      className="relative h-screen flex items-center justify-center bg-cyber-black"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        onClick={onVideoClick}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        playsInline
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      
      {/* Video Controls Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isPlaying && isActive && (
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        )}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div></div>
          <button
            onClick={onMuteToggle}
            className="p-2 rounded-full glass-dark pointer-events-auto hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Bottom Section */}
        <div className="flex items-end justify-between">
          {/* Left Side - User Info & Caption */}
          <div className="flex-1 mr-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {reel.user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  @{reel.user?.username || 'unknown'}
                </h3>
                <button className="text-cyber-purple text-sm font-medium hover:text-cyber-blue transition-colors pointer-events-auto">
                  Follow
                </button>
              </div>
            </div>
            
            {reel.caption && (
              <p className="text-white text-sm mb-2 line-clamp-3">{reel.caption}</p>
            )}
            
            {reel.musicTitle && (
              <div className="flex items-center space-x-2 text-white text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center animate-spin">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>{reel.musicTitle}</span>
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleLikeClick}
              className={`flex flex-col items-center transition-colors pointer-events-auto ${
                isLiked ? 'text-cyber-pink' : 'text-white'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1">{likesCount}</span>
            </button>
            
            <button className="flex flex-col items-center text-white pointer-events-auto hover:text-cyber-purple transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">{reel.commentsCount || 0}</span>
            </button>
            
            <button className="flex flex-col items-center text-white pointer-events-auto hover:text-cyber-purple transition-colors">
              <Share2 className="w-6 h-6" />
              <span className="text-xs mt-1">{reel.sharesCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reels;
