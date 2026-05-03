package com.cryptlink.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
public class MediaProcessingService {

    @Autowired
    private StorageService storageService;

    // Supported image formats
    private static final Set<String> SUPPORTED_IMAGE_FORMATS = Set.of(
        "jpg", "jpeg", "png", "gif", "webp", "bmp"
    );

    // Supported video formats
    private static final Set<String> SUPPORTED_VIDEO_FORMATS = Set.of(
        "mp4", "webm", "mov", "avi", "mkv"
    );

    // Supported audio formats
    private static final Set<String> SUPPORTED_AUDIO_FORMATS = Set.of(
        "mp3", "wav", "aac", "ogg", "m4a"
    );

    /**
     * Process uploaded media file
     */
    @Async
    public CompletableFuture<MediaProcessResult> processMedia(MultipartFile file, String type) {
        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            
            MediaProcessResult result = new MediaProcessResult();
            result.setOriginalFilename(originalFilename);
            result.setOriginalSize(file.getSize());
            result.setMimeType(file.getContentType());

            switch (type.toLowerCase()) {
                case "image":
                    return processImage(file, result);
                case "video":
                    return processVideo(file, result);
                case "audio":
                    return processAudio(file, result);
                default:
                    result.setError("Unsupported media type: " + type);
                    return CompletableFuture.completedFuture(result);
            }

        } catch (Exception e) {
            MediaProcessResult result = new MediaProcessResult();
            result.setError("Media processing failed: " + e.getMessage());
            return CompletableFuture.completedFuture(result);
        }
    }

    /**
     * Process image with advanced features
     */
    private CompletableFuture<MediaProcessResult> processImage(MultipartFile file, MediaProcessResult result) {
        try {
            BufferedImage originalImage = ImageIO.read(file.getInputStream());
            
            // Generate multiple sizes
            Map<String, String> processedUrls = new HashMap<>();
            
            // Thumbnail (150x150)
            String thumbnailUrl = generateImageThumbnail(originalImage, 150, 150);
            processedUrls.put("thumbnail", thumbnailUrl);
            
            // Medium size (500x500)
            String mediumUrl = generateImageMedium(originalImage, 500, 500);
            processedUrls.put("medium", mediumUrl);
            
            // Large size (1080x1080)
            String largeUrl = generateImageLarge(originalImage, 1080, 1080);
            processedUrls.put("large", largeUrl);
            
            // Original (with compression)
            String originalUrl = uploadCompressedImage(file);
            processedUrls.put("original", originalUrl);
            
            // Extract metadata
            ImageMetadata metadata = extractImageMetadata(originalImage);
            
            result.setProcessedUrls(processedUrls);
            result.setMetadata(metadata);
            result.setSuccess(true);
            
            return CompletableFuture.completedFuture(result);

        } catch (Exception e) {
            result.setError("Image processing failed: " + e.getMessage());
            return CompletableFuture.completedFuture(result);
        }
    }

    /**
     * Process video with advanced features
     */
    private CompletableFuture<MediaProcessResult> processVideo(MultipartFile file, MediaProcessResult result) {
        try {
            // For now, we'll simulate video processing
            // In a real implementation, you'd use FFmpeg
            
            Map<String, String> processedUrls = new HashMap<>();
            
            // Upload original video
            String originalUrl = storageService.uploadFile(file, "videos/original");
            processedUrls.put("original", originalUrl);
            
            // Generate thumbnail (first frame)
            String thumbnailUrl = generateVideoThumbnail(file);
            processedUrls.put("thumbnail", thumbnailUrl);
            
            // Generate preview (compressed version)
            String previewUrl = generateVideoPreview(file);
            processedUrls.put("preview", previewUrl);
            
            // Extract metadata
            VideoMetadata metadata = extractVideoMetadata(file);
            
            result.setProcessedUrls(processedUrls);
            result.setMetadata(metadata);
            result.setSuccess(true);
            
            return CompletableFuture.completedFuture(result);

        } catch (Exception e) {
            result.setError("Video processing failed: " + e.getMessage());
            return CompletableFuture.completedFuture(result);
        }
    }

    /**
     * Process audio with advanced features
     */
    private CompletableFuture<MediaProcessResult> processAudio(MultipartFile file, MediaProcessResult result) {
        try {
            Map<String, String> processedUrls = new HashMap<>();
            
            // Upload original audio
            String originalUrl = storageService.uploadFile(file, "audio/original");
            processedUrls.put("original", originalUrl);
            
            // Generate waveform data
            List<Integer> waveform = generateAudioWaveform(file);
            
            // Extract metadata
            AudioMetadata metadata = extractAudioMetadata(file);
            
            result.setProcessedUrls(processedUrls);
            result.setMetadata(metadata);
            result.setSuccess(true);
            
            return CompletableFuture.completedFuture(result);

        } catch (Exception e) {
            result.setError("Audio processing failed: " + e.getMessage());
            return CompletableFuture.completedFuture(result);
        }
    }

    /**
     * Generate image thumbnail
     */
    private String generateImageThumbnail(BufferedImage originalImage, int width, int height) throws IOException {
        BufferedImage thumbnail = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = thumbnail.createGraphics();
        
        // Set rendering hints for better quality
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw scaled image
        g2d.drawImage(originalImage, 0, 0, width, height, null);
        g2d.dispose();
        
        // Convert to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(thumbnail, "jpg", baos);
        
        // Create multipart file
        byte[] imageBytes = baos.toByteArray();
        MultipartFile thumbnailFile = new MockMultipartFile(
            "thumbnail.jpg", 
            "thumbnail.jpg", 
            "image/jpeg", 
            imageBytes
        );
        
        return storageService.uploadFile(thumbnailFile, "images/thumbnails");
    }

    /**
     * Generate medium size image
     */
    private String generateImageMedium(BufferedImage originalImage, int width, int height) throws IOException {
        // Similar to thumbnail but with medium size
        return generateImageThumbnail(originalImage, width, height).replace("thumbnails", "medium");
    }

    /**
     * Generate large size image
     */
    private String generateImageLarge(BufferedImage originalImage, int width, int height) throws IOException {
        // Similar to thumbnail but with large size
        return generateImageThumbnail(originalImage, width, height).replace("thumbnails", "large");
    }

    /**
     * Upload compressed image
     */
    private String uploadCompressedImage(MultipartFile file) throws IOException {
        // For now, just upload the original
        // In a real implementation, you'd compress it
        return storageService.uploadFile(file, "images/original");
    }

    /**
     * Generate video thumbnail (simulated)
     */
    private String generateVideoThumbnail(MultipartFile videoFile) throws IOException {
        // In a real implementation, you'd use FFmpeg to extract the first frame
        // For now, we'll create a placeholder
        BufferedImage thumbnail = new BufferedImage(320, 240, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = thumbnail.createGraphics();
        g2d.setColor(Color.DARK_GRAY);
        g2d.fillRect(0, 0, 320, 240);
        g2d.setColor(Color.WHITE);
        g2d.drawString("Video Thumbnail", 100, 120);
        g2d.dispose();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(thumbnail, "jpg", baos);
        
        byte[] imageBytes = baos.toByteArray();
        MultipartFile thumbnailFile = new MockMultipartFile(
            "video_thumbnail.jpg", 
            "video_thumbnail.jpg", 
            "image/jpeg", 
            imageBytes
        );
        
        return storageService.uploadFile(thumbnailFile, "videos/thumbnails");
    }

    /**
     * Generate video preview (simulated)
     */
    private String generateVideoPreview(MultipartFile videoFile) throws IOException {
        // In a real implementation, you'd use FFmpeg to create a compressed version
        // For now, just upload the original
        return storageService.uploadFile(videoFile, "videos/preview");
    }

    /**
     * Generate audio waveform (simulated)
     */
    private List<Integer> generateAudioWaveform(MultipartFile audioFile) {
        // In a real implementation, you'd analyze the audio file
        // For now, return a simulated waveform
        List<Integer> waveform = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < 100; i++) {
            waveform.add(random.nextInt(256));
        }
        return waveform;
    }

    /**
     * Extract image metadata
     */
    private ImageMetadata extractImageMetadata(BufferedImage image) {
        ImageMetadata metadata = new ImageMetadata();
        metadata.setWidth(image.getWidth());
        metadata.setHeight(image.getHeight());
        metadata.setColorType(image.getType());
        metadata.setHasAlpha(image.getAlphaRaster() != null);
        return metadata;
    }

    /**
     * Extract video metadata (simulated)
     */
    private VideoMetadata extractVideoMetadata(MultipartFile videoFile) {
        VideoMetadata metadata = new VideoMetadata();
        metadata.setDuration(30.0); // Simulated duration
        metadata.setBitrate(1000000); // Simulated bitrate
        metadata.setFramerate(30.0); // Simulated framerate
        metadata.setCodec("H.264"); // Simulated codec
        return metadata;
    }

    /**
     * Extract audio metadata (simulated)
     */
    private AudioMetadata extractAudioMetadata(MultipartFile audioFile) {
        AudioMetadata metadata = new AudioMetadata();
        metadata.setDuration(180.0); // Simulated duration
        metadata.setBitrate(128000); // Simulated bitrate
        metadata.setSampleRate(44100); // Simulated sample rate
        metadata.setChannels(2); // Simulated channels
        metadata.setCodec("MP3"); // Simulated codec
        return metadata;
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    /**
     * Check if format is supported
     */
    public boolean isFormatSupported(String filename, String type) {
        String extension = getFileExtension(filename);
        
        switch (type.toLowerCase()) {
            case "image":
                return SUPPORTED_IMAGE_FORMATS.contains(extension);
            case "video":
                return SUPPORTED_VIDEO_FORMATS.contains(extension);
            case "audio":
                return SUPPORTED_AUDIO_FORMATS.contains(extension);
            default:
                return false;
        }
    }

    // Result classes
    public static class MediaProcessResult {
        private boolean success;
        private String error;
        private String originalFilename;
        private long originalSize;
        private String mimeType;
        private Map<String, String> processedUrls;
        private Object metadata;

        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public String getOriginalFilename() { return originalFilename; }
        public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
        public long getOriginalSize() { return originalSize; }
        public void setOriginalSize(long originalSize) { this.originalSize = originalSize; }
        public String getMimeType() { return mimeType; }
        public void setMimeType(String mimeType) { this.mimeType = mimeType; }
        public Map<String, String> getProcessedUrls() { return processedUrls; }
        public void setProcessedUrls(Map<String, String> processedUrls) { this.processedUrls = processedUrls; }
        public Object getMetadata() { return metadata; }
        public void setMetadata(Object metadata) { this.metadata = metadata; }
    }

    public static class ImageMetadata {
        private int width;
        private int height;
        private int colorType;
        private boolean hasAlpha;

        // Getters and setters
        public int getWidth() { return width; }
        public void setWidth(int width) { this.width = width; }
        public int getHeight() { return height; }
        public void setHeight(int height) { this.height = height; }
        public int getColorType() { return colorType; }
        public void setColorType(int colorType) { this.colorType = colorType; }
        public boolean getHasAlpha() { return hasAlpha; }
        public void setHasAlpha(boolean hasAlpha) { this.hasAlpha = hasAlpha; }
    }

    public static class VideoMetadata {
        private double duration;
        private long bitrate;
        private double framerate;
        private String codec;

        // Getters and setters
        public double getDuration() { return duration; }
        public void setDuration(double duration) { this.duration = duration; }
        public long getBitrate() { return bitrate; }
        public void setBitrate(long bitrate) { this.bitrate = bitrate; }
        public double getFramerate() { return framerate; }
        public void setFramerate(double framerate) { this.framerate = framerate; }
        public String getCodec() { return codec; }
        public void setCodec(String codec) { this.codec = codec; }
    }

    public static class AudioMetadata {
        private double duration;
        private long bitrate;
        private int sampleRate;
        private int channels;
        private String codec;

        // Getters and setters
        public double getDuration() { return duration; }
        public void setDuration(double duration) { this.duration = duration; }
        public long getBitrate() { return bitrate; }
        public void setBitrate(long bitrate) { this.bitrate = bitrate; }
        public int getSampleRate() { return sampleRate; }
        public void setSampleRate(int sampleRate) { this.sampleRate = sampleRate; }
        public int getChannels() { return channels; }
        public void setChannels(int channels) { this.channels = channels; }
        public String getCodec() { return codec; }
        public void setCodec(String codec) { this.codec = codec; }
    }
}
