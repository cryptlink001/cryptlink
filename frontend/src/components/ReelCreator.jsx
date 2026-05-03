import React, { useState, useRef } from 'react';
import { Video, X, Music, Upload, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { reelAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const ReelCreator = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (video only)
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only video files are allowed');
        return;
      }

      // Validate file size (100MB max for reels)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video size must be less than 100MB');
        return;
      }

      setVideoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
    setIsPlaying(false);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video');
      return;
    }

    setLoading(true);

    try {
      // Upload video first
      let videoUrl = '';
      
      // In a real implementation, you'd upload to cloud storage
      // For now, we'll simulate the upload
      videoUrl = `https://cryptlink-media.r2.dev/reels/${Date.now()}_${videoFile.name}`;
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create reel
      const reelData = {
        caption: caption.trim(),
        videoUrl,
        duration,
        musicTitle: musicTitle.trim(),
        musicArtist: musicArtist.trim(),
        tags: tags.trim(),
        isPrivate,
        allowComments,
        allowDuet
      };

      const response = await reelAPI.createReel(reelData);
      
      toast.success('Reel created successfully!');
      resetForm();
      setIsOpen(false);
      
    } catch (error) {
      toast.error('Failed to create reel');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCaption('');
    setVideoFile(null);
    setVideoPreview('');
    setMusicTitle('');
    setMusicArtist('');
    setTags('');
    setIsPrivate(false);
    setAllowComments(true);
    setAllowDuet(true);
    setIsPlaying(false);
    setIsMuted(true);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full glass-dark rounded-2xl border border-gray-800 p-6 hover:border-cyber-purple transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-purple flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">Create a Reel</p>
              <p className="text-cyber-gray text-sm">Share a short video with the world</p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Create Reel</h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-cyber-gray" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Video Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!videoPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[9/16] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-cyber-purple transition-colors"
              >
                <Upload className="w-12 h-12 text-cyber-gray mb-2" />
                <p className="text-white font-medium">Upload Video</p>
                <p className="text-cyber-gray text-sm">MP4, WebM (Max 100MB)</p>
              </button>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full aspect-[9/16] object-cover rounded-lg"
                  onLoadedMetadata={handleVideoLoad}
                  loop
                  muted={isMuted}
                />
                
                {/* Video Controls */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="pointer-events-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Video Info */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                    {formatDuration(duration)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1 rounded bg-black/50 text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="p-1 rounded bg-black/50 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="cyber-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={2}
              maxLength={2200}
            />
            <p className="text-xs text-cyber-gray mt-1 text-right">
              {caption.length}/2200
            </p>
          </div>

          {/* Music */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Song title"
                className="cyber-input w-full px-4 py-2 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <div>
              <input
                type="text"
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="Artist"
                className="cyber-input w-full px-4 py-2 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (comma separated)"
              className="cyber-input w-full px-4 py-2 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          {/* Privacy Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-white">
                <span>Private reel</span>
              </label>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPrivate ? 'bg-cyber-purple' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPrivate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-white">
                <span>Allow comments</span>
              </label>
              <button
                type="button"
                onClick={() => setAllowComments(!allowComments)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowComments ? 'bg-cyber-purple' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowComments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-white">
                <span>Allow duet</span>
              </label>
              <button
                type="button"
                onClick={() => setAllowDuet(!allowDuet)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowDuet ? 'bg-cyber-purple' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowDuet ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-cyber-gray hover:border-white hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !videoFile}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-pink to-cyber-purple text-white font-semibold hover:shadow-cyber-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReelCreator;
