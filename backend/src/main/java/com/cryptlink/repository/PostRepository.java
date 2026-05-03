package com.cryptlink.repository;

import com.cryptlink.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND (p.isPrivate = false OR p.user.id = :userId) ORDER BY p.createdAt DESC")
    Page<Post> findFeedPosts(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT p FROM Post p JOIN p.user.followers f WHERE f.id = :userId AND p.isDeleted = false ORDER BY p.createdAt DESC")
    Page<Post> findFollowingPosts(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND p.isDeleted = false ORDER BY p.createdAt DESC")
    Page<Post> findUserPosts(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false ORDER BY p.likesCount DESC, p.createdAt DESC")
    Page<Post> findTrendingPosts(Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.caption LIKE %:query% ORDER BY p.createdAt DESC")
    Page<Post> searchPostsByCaption(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.location LIKE %:location% ORDER BY p.createdAt DESC")
    Page<Post> findPostsByLocation(@Param("location") String location, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.user.id IN :userIds ORDER BY p.createdAt DESC")
    Page<Post> findPostsByUsers(@Param("userIds") List<UUID> userIds, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId AND p.isDeleted = false")
    Long countUserPosts(@Param("userId") UUID userId);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.tags LIKE %:tag% ORDER BY p.createdAt DESC")
    Page<Post> findPostsByTag(@Param("tag") String tag, Pageable pageable);
}
