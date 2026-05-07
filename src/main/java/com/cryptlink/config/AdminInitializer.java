package com.cryptlink.config;

import com.cryptlink.model.User;
import com.cryptlink.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Configuration
public class AdminInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Bean
    @Transactional
    public CommandLineRunner initAdminUser() {
        return args -> {
            try {
                // Check if admin user already exists
                if (!userRepository.existsByEmail("cryptlink001@gmail.com")) {
                    // Create admin user
                    User admin = new User();
                    admin.setUsername("cryptlink001");
                    admin.setEmail("cryptlink001@gmail.com");
                    admin.setPasswordHash(passwordEncoder.encode("CryptLink"));
                    admin.setDisplayName("CryptLink Admin");
                    admin.setRole("ADMIN");
                    admin.setIsOnline(true);
                    admin.setLastSeen(LocalDateTime.now());
                    admin.setCreatedAt(LocalDateTime.now());
                    admin.setUpdatedAt(LocalDateTime.now());
                    
                    userRepository.save(admin);
                    logger.info("✅ Admin user created successfully: cryptlink001@gmail.com");
                } else {
                    logger.info("ℹ️ Admin user already exists: cryptlink001@gmail.com");
                }
            } catch (Exception e) {
                logger.error("❌ Error creating admin user: " + e.getMessage(), e);
            }
        };
    }
}
