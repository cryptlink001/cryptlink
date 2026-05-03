package com.cryptlink.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class SupabaseStorageService implements StorageService {

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String bucketName;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(String supabaseUrl, String supabaseKey, String bucketName) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.bucketName = bucketName;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        try {
            // Generate unique filename
            String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            // Prepare the file upload request
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;
            
            // Create request body
            Map<String, Object> body = new HashMap<>();
            body.put("file", file.getBytes());

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Upload file
            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                return getPublicUrl(fileName);
            } else {
                throw new IOException("Failed to upload file to Supabase: " + response.getStatusCode());
            }

        } catch (Exception e) {
            throw new IOException("Error uploading file to Supabase: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            // Extract filename from URL
            String fileName = extractFileNameFromUrl(fileUrl);
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            // Delete file
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;
            
            restTemplate.exchange(
                deleteUrl,
                HttpMethod.DELETE,
                requestEntity,
                String.class
            );

        } catch (Exception e) {
            throw new RuntimeException("Error deleting file from Supabase: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPublicUrl(String fileName) {
        return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
    }

    @Override
    public Map<String, Object> getFileInfo(String fileName) {
        try {
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            // Get file info
            String infoUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;
            
            ResponseEntity<Map> response = restTemplate.exchange(
                infoUrl,
                HttpMethod.GET,
                requestEntity,
                Map.class
            );

            return response.getBody();

        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    @Override
    public boolean isFileExists(String fileName) {
        try {
            Map<String, Object> fileInfo = getFileInfo(fileName);
            return fileInfo != null && !fileInfo.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private String extractFileNameFromUrl(String fileUrl) {
        // Extract filename from public URL
        if (fileUrl.contains("/public/")) {
            return fileUrl.substring(fileUrl.indexOf("/public/") + 8);
        }
        return fileUrl;
    }
}
