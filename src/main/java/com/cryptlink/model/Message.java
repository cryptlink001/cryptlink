package com.cryptlink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@EntityListeners(AuditingEntityListener.class)
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;
    
    @Column(nullable = false)
    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 2000, message = "Message too long")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType = MessageType.TEXT;
    
    @Column(name = "media_url")
    private String mediaUrl;
    
    @Column(name = "media_type")
    private String mediaType;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @Column(name = "delete_after_read")
    private Boolean deleteAfterRead = false;
    
    @Column(name = "is_edited")
    private Boolean isEdited = false;
    
    @Column(name = "edited_at")
    private LocalDateTime editedAt;
    
    @Column(name = "is_seen")
    private Boolean isSeen = false;
    
    @Column(name = "seen_at")
    private LocalDateTime seenAt;
    
    @Column(name = "reply_to_id")
    private UUID replyToId;
    
    @Column(name = "is_forwarded")
    private Boolean isForwarded = false;
    
    @Column(name = "forwarded_from_id")
    private UUID forwardedFromId;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Message() {}
    
    public Message(User sender, User receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    
    public Boolean getDeleteAfterRead() { return deleteAfterRead; }
    public void setDeleteAfterRead(Boolean deleteAfterRead) { this.deleteAfterRead = deleteAfterRead; }
    
    public Boolean getIsEdited() { return isEdited; }
    public void setIsEdited(Boolean isEdited) { this.isEdited = isEdited; }
    
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    
    public Boolean getIsSeen() { return isSeen; }
    public void setIsSeen(Boolean isSeen) { this.isSeen = isSeen; }
    
    public LocalDateTime getSeenAt() { return seenAt; }
    public void setSeenAt(LocalDateTime seenAt) { this.seenAt = seenAt; }
    
    public UUID getReplyToId() { return replyToId; }
    public void setReplyToId(UUID replyToId) { this.replyToId = replyToId; }
    
    public Boolean getIsForwarded() { return isForwarded; }
    public void setIsForwarded(Boolean isForwarded) { this.isForwarded = isForwarded; }
    
    public UUID getForwardedFromId() { return forwardedFromId; }
    public void setForwardedFromId(UUID forwardedFromId) { this.forwardedFromId = forwardedFromId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper methods
    public void markAsSeen() {
        this.isSeen = true;
        this.seenAt = LocalDateTime.now();
    }
    
    public void editContent(String newContent) {
        this.content = newContent;
        this.isEdited = true;
        this.editedAt = LocalDateTime.now();
    }
    
    public void delete() {
        this.isDeleted = true;
    }
    
    public enum MessageType {
        TEXT, IMAGE, VIDEO, AUDIO, FILE, VOICE_NOTE, LOCATION, CONTACT
    }
}
