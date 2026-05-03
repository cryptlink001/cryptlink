package com.cryptlink.repository;

import com.cryptlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.username LIKE %:query% AND u.id != :userId")
    Page<User> searchUsersByUsername(@Param("query") String query, @Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.isOnline = true AND u.hideOnlineStatus = false")
    Page<User> findOnlineUsers(Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isOnline = true AND u.hideOnlineStatus = false")
    Long countOnlineUsers();
    
    @Query("SELECT u FROM User u JOIN u.followers f WHERE f.id = :userId")
    Page<User> findFollowers(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT u FROM User u JOIN u.following f WHERE f.id = :userId")
    Page<User> findFollowing(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u JOIN u.followers f WHERE u.id = :targetUserId AND f.id = :currentUserId")
    boolean isUserFollowing(@Param("currentUserId") UUID currentUserId, @Param("targetUserId") UUID targetUserId);
    
    @Query("SELECT u FROM User u WHERE u.id IN :userIds")
    Page<User> findUsersByIds(@Param("userIds") Iterable<UUID> userIds, Pageable pageable);
}
