package com.cryptlink.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    @Value("${server.port:8080}")
    private String serverPort;

    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        try {
            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get(uploadPath, folder);
            Files.createDirectories(uploadDir);

            // Generate unique filename
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(fileName);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Return public URL
            return "http://localhost:" + serverPort + "/uploads/" + folder + "/" + fileName;

        } catch (IOException e) {
            throw new IOException("Failed to upload file locally: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            // Extract filename from URL
            String fileName = extractFileNameFromUrl(fileUrl);
            Path filePath = Paths.get(uploadPath, fileName);
            
            Files.deleteIfExists(filePath);

        } catch (IOException e) {
            throw new RuntimeException("Error deleting local file: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPublicUrl(String fileName) {
        return "http://localhost:" + serverPort + "/uploads/" + fileName;
    }

    @Override
    public Map<String, Object> getFileInfo(String fileName) {
        try {
            Path filePath = Paths.get(uploadPath, fileName);
            File file = filePath.toFile();
            
            if (file.exists()) {
                Map<String, Object> info = new HashMap<>();
                info.put("name", file.getName());
                info.put("size", file.length());
                info.put("lastModified", file.lastModified());
                info.put("exists", true);
                return info;
            }

        } catch (Exception e) {
            // Return empty map if file doesn't exist or error occurs
        }
        
        return new HashMap<>();
    }

    @Override
    public boolean isFileExists(String fileName) {
        try {
            Path filePath = Paths.get(uploadPath, fileName);
            return Files.exists(filePath);
        } catch (Exception e) {
            return false;
        }
    }

    private String extractFileNameFromUrl(String fileUrl) {
        // Extract filename from URL
        if (fileUrl.contains("/uploads/")) {
            return fileUrl.substring(fileUrl.indexOf("/uploads/") + 9);
        }
        return fileUrl;
    }
}
