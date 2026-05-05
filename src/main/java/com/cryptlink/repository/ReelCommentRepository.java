package com.cryptlink.repository;

import com.cryptlink.model.ReelComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReelCommentRepository extends JpaRepository<ReelComment, UUID> {
    
    Page<ReelComment> findByReelIdOrderByCreatedAtDesc(UUID reelId, Pageable pageable);
    
    List<ReelComment> findByReelIdAndParentCommentIdIsNullOrderByCreatedAtDesc(UUID reelId);
    
    List<ReelComment> findByParentCommentIdOrderByCreatedAtAsc(UUID parentCommentId);
    
    @Query("SELECT COUNT(rc) FROM ReelComment rc WHERE rc.reel.id = :reelId AND rc.isDeleted = false")
    Long countActiveCommentsByReelId(@Param("reelId") UUID reelId);
    
    void deleteByReelId(UUID reelId);
}
