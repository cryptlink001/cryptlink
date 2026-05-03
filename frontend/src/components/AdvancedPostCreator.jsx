import React, { useState, useRef } from 'react';
import { Image, Video, X, MapPin, Hash, Users, Lock, Globe } from 'lucide-react';
import { postAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AdvancedPostCreator = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only images and videos are allowed');
        return;
      }

      setMediaFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!caption.trim() && !mediaFile) {
      toast.error('Please add a caption or media');
      return;
    }

    setLoading(true);

    try {
      // Upload media first if exists
      let mediaUrl = '';
      let mediaType = '';
      
      if (mediaFile) {
        // In a real implementation, you'd upload to cloud storage
        // For now, we'll simulate the upload
        mediaUrl = `https://cryptlink-media.r2.dev/uploads/${Date.now()}_${mediaFile.name}`;
        mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Create post
      const postData = {
        caption: caption.trim(),
        mediaUrl,
        mediaType,
        location: location.trim(),
        tags: tags.trim(),
        isPrivate,
        allowComments
      };

      const response = await postAPI.createPost(postData);
      
      toast.success('Post created successfully!');
      resetForm();
      setIsOpen(false);
      
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCaption('');
    setMediaFile(null);
    setMediaPreview('');
    setLocation('');
    setTags('');
    setIsPrivate(false);
    setAllowComments(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full glass-dark rounded-2xl border border-gray-800 p-6 hover:border-cyber-purple transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">What's on your mind?</p>
              <p className="text-cyber-gray text-sm">Share your thoughts with the world</p>
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
          <h2 className="text-xl font-semibold text-white">Create Post</h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-cyber-gray" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white">@{user?.username}</p>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className="flex items-center space-x-1 text-cyber-gray hover:text-white transition-colors"
                >
                  {isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  <span className="text-sm">{isPrivate ? 'Private' : 'Public'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="cyber-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={3}
              maxLength={2200}
            />
            <p className="text-xs text-cyber-gray mt-1 text-right">
              {caption.length}/2200
            </p>
          </div>

          {/* Media Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!mediaPreview ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cyber-button p-4 rounded-lg border border-gray-600 hover:border-cyber-purple transition-colors flex flex-col items-center space-y-2"
                >
                  <Image className="w-6 h-6 text-cyber-gray" />
                  <span className="text-sm text-cyber-gray">Add Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cyber-button p-4 rounded-lg border border-gray-600 hover:border-cyber-purple transition-colors flex flex-col items-center space-y-2"
                >
                  <Video className="w-6 h-6 text-cyber-gray" />
                  <span className="text-sm text-cyber-gray">Add Video</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                {mediaFile?.type.startsWith('image/') ? (
                  <img 
                    src={mediaPreview} 
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <video 
                    src={mediaPreview}
                    className="w-full h-64 object-cover rounded-lg"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-4 h-4" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="cyber-input w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-4 h-4" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags (comma separated)"
                className="cyber-input w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-white">
                <Users className="w-4 h-4" />
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
              disabled={loading || (!caption.trim() && !mediaFile)}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white font-semibold hover:shadow-cyber-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedPostCreator;
