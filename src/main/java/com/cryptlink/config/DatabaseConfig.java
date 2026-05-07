package com.cryptlink.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;

import javax.sql.DataSource;
import java.util.Map;

@Configuration
public class DatabaseConfig {

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return hibernateProperties -> {
            // Fix prepared statement conflicts
            hibernateProperties.put("hibernate.jdbc.batch_size", 20);
            hibernateProperties.put("hibernate.order_inserts", true);
            hibernateProperties.put("hibernate.order_updates", true);
            hibernateProperties.put("hibernate.jdbc.batch_versioned_data", true);
            hibernateProperties.put("hibernate.generate_statistics", false);
            
            // Connection management
            hibernateProperties.put("hibernate.connection.provider_disables_autocommit", true);
            
            // Statement management
            hibernateProperties.put("hibernate.statement_batch_size", 20);
            hibernateProperties.put("hibernate.jdbc.use_get_generated_keys", true);
            hibernateProperties.put("hibernate.jdbc.use_streams_for_binary", true);
        };
    }
}
