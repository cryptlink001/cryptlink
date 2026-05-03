package com.cryptlink.controller;

import com.cryptlink.model.User;
import com.cryptlink.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable UUID userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query, 
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        try {
            // Get current user ID from security context (simplified for now)
            UUID currentUserId = UUID.randomUUID(); // This should come from authentication
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userService.searchUsers(query, currentUserId, pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/online")
    public ResponseEntity<?> getOnlineUsers(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userService.getOnlineUsers(pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable UUID userId,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> followers = userService.getFollowers(userId, pageable);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable UUID userId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> following = userService.getFollowing(userId, pageable);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable UUID userId, @RequestBody User updatedUser) {
        try {
            User user = userService.updateUserProfile(userId, updatedUser);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/{userId}/privacy")
    public ResponseEntity<?> updatePrivacySettings(@PathVariable UUID userId, @RequestBody User privacySettings) {
        try {
            User user = userService.updatePrivacySettings(userId, privacySettings);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/{userId}/follow/{targetUserId}")
    public ResponseEntity<?> followUser(@PathVariable UUID userId, @PathVariable UUID targetUserId) {
        try {
            userService.followUser(userId, targetUserId);
            return ResponseEntity.ok("User followed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/{userId}/unfollow/{targetUserId}")
    public ResponseEntity<?> unfollowUser(@PathVariable UUID userId, @PathVariable UUID targetUserId) {
        try {
            userService.unfollowUser(userId, targetUserId);
            return ResponseEntity.ok("User unfollowed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/{userId}/online")
    public ResponseEntity<?> updateOnlineStatus(@PathVariable UUID userId, @RequestParam boolean isOnline) {
        try {
            User user = userService.updateOnlineStatus(userId, isOnline);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/{userId}/is-following/{targetUserId}")
    public ResponseEntity<?> isFollowing(@PathVariable UUID userId, @PathVariable UUID targetUserId) {
        try {
            boolean following = userService.isFollowing(userId, targetUserId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/online/count")
    public ResponseEntity<?> getOnlineUsersCount() {
        try {
            Long count = userService.getOnlineUsersCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
