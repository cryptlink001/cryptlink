package com.cryptlink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    private String username;
    
    @Column(unique = true, nullable = false)
    @Email(message = "Email should be valid")
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @Column(length = 500)
    private String bio;
    
    @Column(name = "display_name")
    private String displayName;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "is_private")
    private Boolean isPrivate = false;
    
    @Column(name = "hide_online_status")
    private Boolean hideOnlineStatus = false;
    
    @Column(name = "hide_last_seen")
    private Boolean hideLastSeen = false;
    
    @Column(name = "incognito_mode")
    private Boolean incognitoMode = false;
    
    @Column(name = "allow_messages_from_anyone")
    private Boolean allowMessagesFromAnyone = true;
    
    @Column(name = "role")
    private String role = "USER";
    
    @Column(name = "last_seen")
    private LocalDateTime lastSeen;
    
    @Column(name = "is_online")
    private Boolean isOnline = false;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "following_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    private Set<User> followers = new HashSet<>();
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_following",
        joinColumns = @JoinColumn(name = "follower_id"),
        inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    private Set<User> following = new HashSet<>();
    
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Message> sentMessages = new HashSet<>();
    
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Message> receivedMessages = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Post> posts = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Reel> reels = new HashSet<>();
    
    // Constructors
    public User() {}
    
    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public Boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    
    public Boolean getHideOnlineStatus() { return hideOnlineStatus; }
    public void setHideOnlineStatus(Boolean hideOnlineStatus) { this.hideOnlineStatus = hideOnlineStatus; }
    
    public Boolean getHideLastSeen() { return hideLastSeen; }
    public void setHideLastSeen(Boolean hideLastSeen) { this.hideLastSeen = hideLastSeen; }
    
    public Boolean getIncognitoMode() { return incognitoMode; }
    public void setIncognitoMode(Boolean incognitoMode) { this.incognitoMode = incognitoMode; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Boolean getAllowMessagesFromAnyone() { return allowMessagesFromAnyone; }
    public void setAllowMessagesFromAnyone(Boolean allowMessagesFromAnyone) { this.allowMessagesFromAnyone = allowMessagesFromAnyone; }
    
    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
    
    public Boolean getIsOnline() { return isOnline; }
    public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Set<User> getFollowers() { return followers; }
    public void setFollowers(Set<User> followers) { this.followers = followers; }
    
    public Set<User> getFollowing() { return following; }
    public void setFollowing(Set<User> following) { this.following = following; }
    
    public Set<Message> getSentMessages() { return sentMessages; }
    public void setSentMessages(Set<Message> sentMessages) { this.sentMessages = sentMessages; }
    
    public Set<Message> getReceivedMessages() { return receivedMessages; }
    public void setReceivedMessages(Set<Message> receivedMessages) { this.receivedMessages = receivedMessages; }
    
    public Set<Post> getPosts() { return posts; }
    public void setPosts(Set<Post> posts) { this.posts = posts; }
    
    public Set<Reel> getReels() { return reels; }
    public void setReels(Set<Reel> reels) { this.reels = reels; }
    
    // Helper methods
    public void addFollower(User follower) {
        followers.add(follower);
        follower.getFollowing().add(this);
    }
    
    public void removeFollower(User follower) {
        followers.remove(follower);
        follower.getFollowing().remove(this);
    }
    
    public void follow(User following) {
        this.following.add(following);
        following.getFollowers().add(this);
    }
    
    public void unfollow(User following) {
        this.following.remove(following);
        following.getFollowers().remove(this);
    }
    
    public boolean isFollowing(User user) {
        return following.contains(user);
    }
    
    public boolean isFollowedBy(User user) {
        return followers.contains(user);
    }
}
