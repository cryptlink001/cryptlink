import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Eye, EyeOff, Shield, Palette, HelpCircle, LogOut, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phoneNumber: '',
    profilePictureUrl: '',
  });
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    hideOnlineStatus: false,
    hideLastSeen: false,
    incognitoMode: false,
    allowMessagesFromAnyone: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        profilePictureUrl: user.profilePictureUrl || '',
      });
      setPrivacySettings({
        isPrivate: user.isPrivate || false,
        hideOnlineStatus: user.hideOnlineStatus || false,
        hideLastSeen: user.hideLastSeen || false,
        incognitoMode: user.incognitoMode || false,
        allowMessagesFromAnyone: user.allowMessagesFromAnyone !== false,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userAPI.updateProfile(user.id, formData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async (setting, value) => {
    const newSettings = { ...privacySettings, [setting]: value };
    setPrivacySettings(newSettings);
    
    try {
      const response = await userAPI.updatePrivacySettings(user.id, newSettings);
      updateUser(response.data);
      toast.success(`${setting} updated successfully`);
    } catch (error) {
      toast.error('Failed to update privacy settings');
      // Revert on error
      setPrivacySettings(prev => ({ ...prev, [setting]: !value }));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="glass-dark rounded-xl border border-gray-800 p-4">
            <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-cyber-purple/20 text-cyber-purple'
                        : 'text-cyber-gray hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="glass-dark rounded-xl border border-gray-800 p-6">
            {activeSection === 'profile' && (
              <ProfileSection 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleProfileUpdate}
                loading={loading}
              />
            )}

            {activeSection === 'privacy' && (
              <PrivacySection 
                settings={privacySettings}
                onSettingChange={handlePrivacyUpdate}
              />
            )}

            {activeSection === 'notifications' && (
              <NotificationsSection />
            )}

            {activeSection === 'security' && (
              <SecuritySection />
            )}

            {activeSection === 'appearance' && (
              <AppearanceSection />
            )}

            {activeSection === 'help' && (
              <HelpSection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSection = ({ formData, setFormData, onSubmit, loading }) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-6">Profile Settings</h3>
    
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
            <span className="text-white font-semibold text-2xl">
              {formData.displayName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <button type="button" className="cyber-button px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white font-medium hover:shadow-cyber-glow transition-all duration-300">
              Change Photo
            </button>
            <p className="text-xs text-cyber-gray mt-1">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="cyber-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
          placeholder="Your display name"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="cyber-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 resize-none"
          rows={4}
          placeholder="Tell us about yourself"
          maxLength={500}
        />
        <p className="text-xs text-cyber-gray mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          className="cyber-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
          placeholder="+1234567890"
        />
        <p className="text-xs text-cyber-gray mt-1">
          This will not be visible to other users
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="cyber-button px-6 py-3 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white font-semibold hover:shadow-cyber-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  </div>
);

const PrivacySection = ({ settings, onSettingChange }) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-6">Privacy Settings</h3>
    
    <div className="space-y-6">
      {/* Private Account */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Private Account</h4>
          <p className="text-sm text-cyber-gray">Only approved followers can see your posts and reels</p>
        </div>
        <button
          onClick={() => onSettingChange('isPrivate', !settings.isPrivate)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.isPrivate ? 'bg-cyber-purple' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.isPrivate ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Hide Online Status */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Hide Online Status</h4>
          <p className="text-sm text-cyber-gray">Others won't see when you're online</p>
        </div>
        <button
          onClick={() => onSettingChange('hideOnlineStatus', !settings.hideOnlineStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.hideOnlineStatus ? 'bg-cyber-purple' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.hideOnlineStatus ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Hide Last Seen */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Hide Last Seen</h4>
          <p className="text-sm text-cyber-gray">Others won't see when you were last active</p>
        </div>
        <button
          onClick={() => onSettingChange('hideLastSeen', !settings.hideLastSeen)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.hideLastSeen ? 'bg-cyber-purple' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.hideLastSeen ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Incognito Mode */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Incognito Mode</h4>
          <p className="text-sm text-cyber-gray">Browse without appearing in searches or suggestions</p>
        </div>
        <button
          onClick={() => onSettingChange('incognitoMode', !settings.incognitoMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.incognitoMode ? 'bg-cyber-purple' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.incognitoMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Allow Messages */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Allow Messages from Anyone</h4>
          <p className="text-sm text-cyber-gray">Anyone can send you messages, not just followers</p>
        </div>
        <button
          onClick={() => onSettingChange('allowMessagesFromAnyone', !settings.allowMessagesFromAnyone)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.allowMessagesFromAnyone ? 'bg-cyber-purple' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.allowMessagesFromAnyone ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  </div>
);

const NotificationsSection = () => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-6">Notification Settings</h3>
    <div className="space-y-4">
      <p className="text-cyber-gray">Notification settings coming soon...</p>
    </div>
  </div>
);

const SecuritySection = () => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-6">Security Settings</h3>
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-white mb-3">Password</h4>
        <button className="cyber-button px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white font-medium hover:shadow-cyber-glow transition-all duration-300">
          Change Password
        </button>
      </div>
      
      <div>
        <h4 className="font-medium text-white mb-3">Two-Factor Authentication</h4>
        <button className="cyber-button px-4 py-2 rounded-lg border border-cyber-purple text-cyber-purple font-medium hover:bg-cyber-purple/10 transition-colors">
          Enable 2FA
        </button>
      </div>
    </div>
  </div>
);

const AppearanceSection = () => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-6">Appearance</h3>
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-white mb-3">Theme</h4>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyber-purple/20 text-cyber-purple border border-cyber-purple">
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-600 text-cyber-gray hover:border-white hover:text-white transition-colors">
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const HelpSection = () => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-6">Help & Support</h3>
    <div className="space-y-4">
      <p className="text-cyber-gray">Help section coming soon...</p>
    </div>
  </div>
);

export default Settings;
