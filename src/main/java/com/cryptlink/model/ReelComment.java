package com.cryptlink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reel_comments")
@EntityListeners(AuditingEntityListener.class)
public class ReelComment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reel_id", nullable = false)
    private Reel reel;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 1000, message = "Comment too long")
    private String content;
    
    @Column(name = "parent_comment_id")
    private UUID parentCommentId;
    
    @Column(name = "likes_count")
    private Long likesCount = 0L;
    
    @Column(name = "replies_count")
    private Long repliesCount = 0L;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @Column(name = "is_edited")
    private Boolean isEdited = false;
    
    @Column(name = "edited_at")
    private LocalDateTime editedAt;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ReelComment() {}
    
    public ReelComment(Reel reel, User user, String content) {
        this.reel = reel;
        this.user = user;
        this.content = content;
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public Reel getReel() { return reel; }
    public void setReel(Reel reel) { this.reel = reel; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public UUID getParentCommentId() { return parentCommentId; }
    public void setParentCommentId(UUID parentCommentId) { this.parentCommentId = parentCommentId; }
    
    public Long getLikesCount() { return likesCount; }
    public void setLikesCount(Long likesCount) { this.likesCount = likesCount; }
    
    public Long getRepliesCount() { return repliesCount; }
    public void setRepliesCount(Long repliesCount) { this.repliesCount = repliesCount; }
    
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    
    public Boolean getIsEdited() { return isEdited; }
    public void setIsEdited(Boolean isEdited) { this.isEdited = isEdited; }
    
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper methods
    public void incrementLikes() {
        this.likesCount++;
    }
    
    public void decrementLikes() {
        if (this.likesCount > 0) {
            this.likesCount--;
        }
    }
    
    public void incrementReplies() {
        this.repliesCount++;
    }
    
    public void decrementReplies() {
        if (this.repliesCount > 0) {
            this.repliesCount--;
        }
    }
    
    public void editContent(String newContent) {
        this.content = newContent;
        this.isEdited = true;
        this.editedAt = LocalDateTime.now();
    }
    
    public void delete() {
        this.isDeleted = true;
    }
}
