package com.cryptlink.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class StorageConfig {

    @Value("${cloud.storage.provider:local}")
    private String storageProvider;

    @Value("${cloud.storage.supabase.url:}")
    private String supabaseUrl;

    @Value("${cloud.storage.supabase.key:}")
    private String supabaseKey;

    @Value("${cloud.storage.bucket:}")
    private String bucketName;

    @Bean
    public S3Client s3Client() {
        if ("cloudflare_r2".equals(storageProvider)) {
            return S3Client.builder()
                .region(Region.AUTO)
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(
                        cloudStorageAccessKey,
                        cloudStorageSecretKey
                    )
                ))
                .build();
        }
        return null; // Use local storage for other providers
    }

    @Bean
    public StorageService storageService() {
        switch (storageProvider.toLowerCase()) {
            case "supabase":
                return new SupabaseStorageService(supabaseUrl, supabaseKey, bucketName);
            case "cloudflare_r2":
                return new R2StorageService(s3Client(), bucketName);
            default:
                return new LocalStorageService();
        }
    }
}
