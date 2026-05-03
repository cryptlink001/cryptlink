package com.cryptlink.repository;

import com.cryptlink.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    Page<Comment> findByPostIdOrderByCreatedAtDesc(UUID postId, Pageable pageable);
    
    List<Comment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtDesc(UUID postId);
    
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(UUID parentCommentId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId AND c.isDeleted = false")
    Long countActiveCommentsByPostId(@Param("postId") UUID postId);
    
    void deleteByPostId(UUID postId);
}
