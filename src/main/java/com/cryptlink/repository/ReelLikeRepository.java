package com.cryptlink.repository;

import com.cryptlink.model.Reel;
import com.cryptlink.model.ReelLike;
import com.cryptlink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReelLikeRepository extends JpaRepository<ReelLike, UUID> {
    
    ReelLike findByReelAndUser(Reel reel, User user);
    
    void deleteByReelAndUser(Reel reel, User user);
    
    boolean existsByReelAndUser(Reel reel, User user);
}
