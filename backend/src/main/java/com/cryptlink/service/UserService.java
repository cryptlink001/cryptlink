package com.cryptlink.service;

import com.cryptlink.model.User;
import com.cryptlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }
    
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
    
    @Transactional(readOnly = true)
    public Page<User> searchUsers(String query, UUID currentUserId, Pageable pageable) {
        return userRepository.searchUsersByUsername(query, currentUserId, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<User> getOnlineUsers(Pageable pageable) {
        return userRepository.findOnlineUsers(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<User> getFollowers(UUID userId, Pageable pageable) {
        return userRepository.findFollowers(userId, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<User> getFollowing(UUID userId, Pageable pageable) {
        return userRepository.findFollowing(userId, pageable);
    }
    
    @Transactional
    public User updateUserProfile(UUID userId, User updatedUser) {
        User user = getUserById(userId);
        
        if (updatedUser.getDisplayName() != null) {
            user.setDisplayName(updatedUser.getDisplayName());
        }
        if (updatedUser.getBio() != null) {
            user.setBio(updatedUser.getBio());
        }
        if (updatedUser.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
        }
        if (updatedUser.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        
        return userRepository.save(user);
    }
    
    @Transactional
    public User updatePrivacySettings(UUID userId, User privacySettings) {
        User user = getUserById(userId);
        
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
    
    @Transactional
    public void followUser(UUID currentUserId, UUID targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new RuntimeException("You cannot follow yourself");
        }
        
        User currentUser = getUserById(currentUserId);
        User targetUser = getUserById(targetUserId);
        
        if (currentUser.isFollowing(targetUser)) {
            throw new RuntimeException("You are already following this user");
        }
        
        currentUser.follow(targetUser);
        userRepository.save(currentUser);
    }
    
    @Transactional
    public void unfollowUser(UUID currentUserId, UUID targetUserId) {
        User currentUser = getUserById(currentUserId);
        User targetUser = getUserById(targetUserId);
        
        if (!currentUser.isFollowing(targetUser)) {
            throw new RuntimeException("You are not following this user");
        }
        
        currentUser.unfollow(targetUser);
        userRepository.save(currentUser);
    }
    
    @Transactional
    public User updateOnlineStatus(UUID userId, boolean isOnline) {
        User user = getUserById(userId);
        user.setIsOnline(isOnline);
        if (!isOnline) {
            user.setLastSeen(java.time.LocalDateTime.now());
        }
        return userRepository.save(user);
    }
    
    @Transactional(readOnly = true)
    public boolean isFollowing(UUID currentUserId, UUID targetUserId) {
        return userRepository.isUserFollowing(currentUserId, targetUserId);
    }
    
    @Transactional(readOnly = true)
    public Long getOnlineUsersCount() {
        return userRepository.countOnlineUsers();
    }
}
