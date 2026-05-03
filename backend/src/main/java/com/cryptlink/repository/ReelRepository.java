package com.cryptlink.repository;

import com.cryptlink.model.Reel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReelRepository extends JpaRepository<Reel, UUID> {
    
    @Query("SELECT r FROM Reel r WHERE r.isDeleted = false AND (r.isPrivate = false OR r.user.id = :userId) ORDER BY r.createdAt DESC")
    Page<Reel> findFeedReels(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT r FROM Reel r JOIN r.user.followers f WHERE f.id = :userId AND r.isDeleted = false ORDER BY r.createdAt DESC")
    Page<Reel> findFollowingReels(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT r FROM Reel r WHERE r.user.id = :userId AND r.isDeleted = false ORDER BY r.createdAt DESC")
    Page<Reel> findUserReels(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT r FROM Reel r WHERE r.isDeleted = false ORDER BY r.likesCount DESC, r.viewsCount DESC, r.createdAt DESC")
    Page<Reel> findTrendingReels(Pageable pageable);
    
    @Query("SELECT r FROM Reel r WHERE r.isDeleted = false AND r.caption LIKE %:query% ORDER BY r.createdAt DESC")
    Page<Reel> searchReelsByCaption(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT r FROM Reel r WHERE r.isDeleted = false AND r.musicTitle LIKE %:music% ORDER BY r.createdAt DESC")
    Page<Reel> findReelsByMusic(@Param("music") String music, Pageable pageable);
    
    @Query("SELECT r FROM Reel r WHERE r.isDeleted = false AND r.tags LIKE %:tag% ORDER BY r.createdAt DESC")
    Page<Reel> findReelsByTag(@Param("tag") String tag, Pageable pageable);
    
    @Query("SELECT COUNT(r) FROM Reel r WHERE r.user.id = :userId AND r.isDeleted = false")
    Long countUserReels(@Param("userId") UUID userId);
    
    @Query("SELECT r FROM Reel r WHERE r.isDeleted = false ORDER BY RAND()")
    Page<Reel> findRandomReels(Pageable pageable);
    
    @Query("SELECT r FROM Reel r WHERE r.isDeleted = false AND r.allowDuet = true ORDER BY r.createdAt DESC")
    Page<Reel> findReelsForDuet(Pageable pageable);
}
