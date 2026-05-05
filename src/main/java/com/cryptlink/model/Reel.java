package com.cryptlink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "reels")
@EntityListeners(AuditingEntityListener.class)
public class Reel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 2200)
    @Size(max = 2200, message = "Caption too long")
    private String caption;
    
    @Column(nullable = false)
    private String videoUrl;
    
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;
    
    @Column(name = "duration")
    private Double duration;
    
    @Column(name = "music_title")
    private String musicTitle;
    
    @Column(name = "music_artist")
    private String musicArtist;
    
    @Column(name = "original_audio_url")
    private String originalAudioUrl;
    
    @Column(name = "likes_count")
    private Long likesCount = 0L;
    
    @Column(name = "comments_count")
    private Long commentsCount = 0L;
    
    @Column(name = "shares_count")
    private Long sharesCount = 0L;
    
    @Column(name = "views_count")
    private Long viewsCount = 0L;
    
    @Column(name = "is_private")
    private Boolean isPrivate = false;
    
    @Column(name = "allow_comments")
    private Boolean allowComments = true;
    
    @Column(name = "allow_duet")
    private Boolean allowDuet = true;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @Column(name = "is_edited")
    private Boolean isEdited = false;
    
    @Column(name = "edited_at")
    private LocalDateTime editedAt;
    
    @Column(name = "tags")
    private String tags;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "reel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ReelLike> likes = new HashSet<>();
    
    @OneToMany(mappedBy = "reel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ReelComment> comments = new HashSet<>();
    
    // Constructors
    public Reel() {}
    
    public Reel(User user, String caption, String videoUrl) {
        this.user = user;
        this.caption = caption;
        this.videoUrl = videoUrl;
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
    
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    
    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }
    
    public String getMusicTitle() { return musicTitle; }
    public void setMusicTitle(String musicTitle) { this.musicTitle = musicTitle; }
    
    public String getMusicArtist() { return musicArtist; }
    public void setMusicArtist(String musicArtist) { this.musicArtist = musicArtist; }
    
    public String getOriginalAudioUrl() { return originalAudioUrl; }
    public void setOriginalAudioUrl(String originalAudioUrl) { this.originalAudioUrl = originalAudioUrl; }
    
    public Long getLikesCount() { return likesCount; }
    public void setLikesCount(Long likesCount) { this.likesCount = likesCount; }
    
    public Long getCommentsCount() { return commentsCount; }
    public void setCommentsCount(Long commentsCount) { this.commentsCount = commentsCount; }
    
    public Long getSharesCount() { return sharesCount; }
    public void setSharesCount(Long sharesCount) { this.sharesCount = sharesCount; }
    
    public Long getViewsCount() { return viewsCount; }
    public void setViewsCount(Long viewsCount) { this.viewsCount = viewsCount; }
    
    public Boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    
    public Boolean getAllowComments() { return allowComments; }
    public void setAllowComments(Boolean allowComments) { this.allowComments = allowComments; }
    
    public Boolean getAllowDuet() { return allowDuet; }
    public void setAllowDuet(Boolean allowDuet) { this.allowDuet = allowDuet; }
    
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    
    public Boolean getIsEdited() { return isEdited; }
    public void setIsEdited(Boolean isEdited) { this.isEdited = isEdited; }
    
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Set<ReelLike> getLikes() { return likes; }
    public void setLikes(Set<ReelLike> likes) { this.likes = likes; }
    
    public Set<ReelComment> getComments() { return comments; }
    public void setComments(Set<ReelComment> comments) { this.comments = comments; }
    
    // Helper methods
    public void incrementLikes() {
        this.likesCount++;
    }
    
    public void decrementLikes() {
        if (this.likesCount > 0) {
            this.likesCount--;
        }
    }
    
    public void incrementComments() {
        this.commentsCount++;
    }
    
    public void decrementComments() {
        if (this.commentsCount > 0) {
            this.commentsCount--;
        }
    }
    
    public void incrementShares() {
        this.sharesCount++;
    }
    
    public void incrementViews() {
        this.viewsCount++;
    }
    
    public void delete() {
        this.isDeleted = true;
    }
    
    public void editCaption(String newCaption) {
        this.caption = newCaption;
        this.isEdited = true;
        this.editedAt = LocalDateTime.now();
    }
}
