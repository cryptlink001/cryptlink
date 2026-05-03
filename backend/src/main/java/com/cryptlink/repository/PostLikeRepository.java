package com.cryptlink.repository;

import com.cryptlink.model.Post;
import com.cryptlink.model.PostLike;
import com.cryptlink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, UUID> {
    
    PostLike findByPostAndUser(Post post, User user);
    
    void deleteByPostAndUser(Post post, User user);
    
    boolean existsByPostAndUser(Post post, User user);
}
