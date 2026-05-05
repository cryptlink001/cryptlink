package com.cryptlink.service;

import com.cryptlink.model.User;
import com.cryptlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PrivacyService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public User updatePrivacySettings(UUID userId, User privacySettings) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update privacy settings
        if (privacySettings.getIsPrivate() != null) {
            user.setIsPrivate(privacySettings.getIsPrivate());
        }
        if (privacySettings.getHideOnlineStatus() != null) {
            user.setHideOnlineStatus(privacySettings.getHideOnlineStatus());
        }
        if (privacySettings.getHideLastSeen() != null) {
            user.setHideLastSeen(privacySettings.getHideLastSeen());
        }
        if (privacySettings.getIncognitoMode() != null) {
            user.setIncognitoMode(privacySettings.getIncognitoMode());
        }
        if (privacySettings.getAllowMessagesFromAnyone() != null) {
            user.setAllowMessagesFromAnyone(privacySettings.getAllowMessagesFromAnyone());
        }
        
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean canViewProfile(UUID viewerId, UUID targetUserId) {
        User viewer = userRepository.findById(viewerId).orElse(null);
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("Target user not found"));
        
        // Can always view own profile
        if (viewerId.equals(targetUserId)) {
            return true;
        }
        
        // If target is private, check if viewer is following
        if (target.getIsPrivate()) {
            return viewer != null && userRepository.isUserFollowing(viewerId, targetUserId);
        }
        
        // If target is in incognito mode, don't show to non-followers
        if (target.getIncognitoMode()) {
            return viewer != null && userRepository.isUserFollowing(viewerId, targetUserId);
        }
        
        return true;
    }

    @Transactional(readOnly = true)
    public boolean canSendMessage(UUID senderId, UUID receiverId) {
        User sender = userRepository.findById(senderId).orElse(null);
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        // Can always message self
        if (senderId.equals(receiverId)) {
            return true;
        }
        
        // Check if receiver allows messages from anyone
        if (receiver.getAllowMessagesFromAnyone()) {
            return true;
        }
        
        // Only allow if sender is following receiver
        return sender != null && userRepository.isUserFollowing(senderId, receiverId);
    }

    @Transactional(readOnly = true)
    public boolean canViewOnlineStatus(UUID viewerId, UUID targetUserId) {
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("Target user not found"));
        
        // If target hides online status, return false
        if (target.getHideOnlineStatus()) {
            return false;
        }
        
        // If target is in incognito mode, only show to followers
        if (target.getIncognitoMode()) {
            return userRepository.isUserFollowing(viewerId, targetUserId);
        }
        
        return true;
    }

    @Transactional(readOnly = true)
    public boolean canViewLastSeen(UUID viewerId, UUID targetUserId) {
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("Target user not found"));
        
        // If target hides last seen, return false
        if (target.getHideLastSeen()) {
            return false;
        }
        
        // If target is in incognito mode, only show to followers
        if (target.getIncognitoMode()) {
            return userRepository.isUserFollowing(viewerId, targetUserId);
        }
        
        return true;
    }

    @Transactional(readOnly = true)
    public List<User> getSearchableUsers(UUID searcherId, String query) {
        // Don't show users in incognito mode in search
        return userRepository.searchUsersByUsername(query, searcherId, null)
            .stream()
            .filter(user -> !user.getIncognitoMode())
            .filter(user -> canViewProfile(searcherId, user.getId()))
            .toList();
    }

    @Transactional(readOnly = true)
    public boolean isUserBlocked(UUID blockerId, UUID targetId) {
        // This would be implemented when we add blocking functionality
        return false;
    }

    @Transactional
    public User enableIncognitoMode(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIncognitoMode(true);
        user.setHideOnlineStatus(true);
        user.setHideLastSeen(true);
        
        return userRepository.save(user);
    }

    @Transactional
    public User disableIncognitoMode(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIncognitoMode(false);
        // Don't automatically change other privacy settings
        
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getPublicProfile(UUID userId, UUID viewerId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create a safe copy with only public information
        User publicProfile = new User();
        publicProfile.setId(user.getId());
        publicProfile.setUsername(user.getUsername());
        publicProfile.setDisplayName(user.getDisplayName());
        publicProfile.setBio(user.getBio());
        publicProfile.setProfilePictureUrl(user.getProfilePictureUrl());
        publicProfile.setIsVerified(user.getIsVerified());
        publicProfile.setCreatedAt(user.getCreatedAt());
        
        // Only show online status if allowed
        if (canViewOnlineStatus(viewerId, userId)) {
            publicProfile.setIsOnline(user.getIsOnline());
        }
        
        // Only show last seen if allowed
        if (canViewLastSeen(viewerId, userId)) {
            publicProfile.setLastSeen(user.getLastSeen());
        }
        
        // Don't expose private information
        publicProfile.setEmail(null);
        publicProfile.setPhoneNumber(null);
        publicProfile.setPasswordHash(null);
        
        return publicProfile;
    }
}
