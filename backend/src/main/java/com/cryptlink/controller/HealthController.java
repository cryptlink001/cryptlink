package com.cryptlink.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("application", "CryptLink");
        health.put("version", "1.0.0");
        
        // Check database connection
        boolean databaseUp = checkDatabase();
        health.put("database", databaseUp ? "UP" : "DOWN");
        
        // Check Redis connection
        boolean redisUp = checkRedis();
        health.put("redis", redisUp ? "UP" : "DOWN");
        
        // Overall status
        String overallStatus = (databaseUp && redisUp) ? "UP" : "DOWN";
        health.put("overall", overallStatus);
        
        return ResponseEntity.ok(health);
    }

    private boolean checkDatabase() {
        try {
            if (dataSource != null) {
                JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                return true;
            }
        } catch (Exception e) {
            // Log error if needed
        }
        return false;
    }

    private boolean checkRedis() {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set("health:check", "ok", 10);
                String result = (String) redisTemplate.opsForValue().get("health:check");
                return "ok".equals(result);
            }
        } catch (Exception e) {
            // Log error if needed
        }
        return false;
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> readiness = new HashMap<>();
        readiness.put("status", "READY");
        readiness.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(readiness);
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> live() {
        Map<String, Object> liveness = new HashMap<>();
        liveness.put("status", "ALIVE");
        liveness.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(liveness);
    }
}
