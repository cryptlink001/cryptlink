package com.cryptlink.repository;

import com.cryptlink.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.createdAt DESC")
    Page<Message> findChatMessages(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.isSeen = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessages(@Param("userId") UUID userId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isSeen = false")
    Long countUnreadMessages(@Param("userId") UUID userId);
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId OR m.receiver.id = :userId) AND m.createdAt >= :since ORDER BY m.createdAt DESC")
    List<Message> findRecentMessages(@Param("userId") UUID userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT DISTINCT m.receiver FROM Message m WHERE m.sender.id = :userId ORDER BY m.createdAt DESC")
    List<UUID> findRecentChatPartners(@Param("userId") UUID userId);
    
    @Query("SELECT m FROM Message m WHERE m.deleteAfterRead = true AND m.isSeen = true AND m.seenAt <= :before")
    List<Message> findMessagesToDelete(@Param("before") LocalDateTime before);
    
    @Query("SELECT m FROM Message m WHERE m.isDeleted = false AND (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.createdAt DESC")
    Page<Message> findActiveChatMessages(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2, Pageable pageable);
}
