package com.cryptlink.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface StorageService {
    
    String uploadFile(MultipartFile file, String folder) throws IOException;
    
    void deleteFile(String fileUrl);
    
    String getPublicUrl(String fileName);
    
    Map<String, Object> getFileInfo(String fileName);
    
    boolean isFileExists(String fileName);
}
