package com.cryptlink.model;

import jakarta.persistence.*;
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
@Table(name = "groups")
@EntityListeners(AuditingEntityListener.class)
public class Group {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    @NotBlank(message = "Group name is required")
    @Size(max = 100, message = "Group name too long")
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupType type = GroupType.PRIVATE;
    
    @Column(name = "invite_link")
    private String inviteLink;
    
    @Column(name = "members_count")
    private Long membersCount = 0L;
    
    @Column(name = "is_private")
    private Boolean isPrivate = true;
    
    @Column(name = "allow_invites")
    private Boolean allowInvites = true;
    
    @Column(name = "require_approval")
    private Boolean requireApproval = false;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<GroupMember> members = new HashSet<>();
    
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<GroupMessage> messages = new HashSet<>();
    
    // Constructors
    public Group() {}
    
    public Group(String name, User creator) {
        this.name = name;
        this.creator = creator;
        this.membersCount = 1L;
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public GroupType getType() { return type; }
    public void setType(GroupType type) { this.type = type; }
    
    public String getInviteLink() { return inviteLink; }
    public void setInviteLink(String inviteLink) { this.inviteLink = inviteLink; }
    
    public Long getMembersCount() { return membersCount; }
    public void setMembersCount(Long membersCount) { this.membersCount = membersCount; }
    
    public Boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    
    public Boolean getAllowInvites() { return allowInvites; }
    public void setAllowInvites(Boolean allowInvites) { this.allowInvites = allowInvites; }
    
    public Boolean getRequireApproval() { return requireApproval; }
    public void setRequireApproval(Boolean requireApproval) { this.requireApproval = requireApproval; }
    
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    
    public Set<GroupMember> getMembers() { return members; }
    public void setMembers(Set<GroupMember> members) { this.members = members; }
    
    public Set<GroupMessage> getMessages() { return messages; }
    public void setMessages(Set<GroupMessage> messages) { this.messages = messages; }
    
    // Helper methods
    public void incrementMembersCount() {
        this.membersCount++;
    }
    
    public void decrementMembersCount() {
        if (this.membersCount > 0) {
            this.membersCount--;
        }
    }
    
    public void delete() {
        this.isDeleted = true;
    }
    
    public enum GroupType {
        PRIVATE, PUBLIC, CHANNEL
    }
}
