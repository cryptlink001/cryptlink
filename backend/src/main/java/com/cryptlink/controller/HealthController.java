package com.cryptlink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @Autowired(required = false)
    private RedisConnectionFactory redisConnectionFactory;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("application", "CryptLink");
        response.put("version", "1.0.0");
        
        // Check database connection
        Map<String, Object> database = new HashMap<>();
        try {
            dataSource.getConnection().close();
            database.put("status", "UP");
            database.put("type", "PostgreSQL");
        } catch (Exception e) {
            database.put("status", "DOWN");
            database.put("error", e.getMessage());
        }
        response.put("database", database);
        
        // Check Redis connection
        Map<String, Object> redis = new HashMap<>();
        try {
            if (redisConnectionFactory != null) {
                redisConnectionFactory.getConnection().ping();
                redis.put("status", "UP");
                redis.put("type", "Redis");
            } else {
                redis.put("status", "DOWN");
                redis.put("error", "Redis not configured");
            }
        } catch (Exception e) {
            redis.put("status", "DOWN");
            redis.put("error", e.getMessage());
        }
        response.put("redis", redis);
        
        return ResponseEntity.ok(response);
    }
}
