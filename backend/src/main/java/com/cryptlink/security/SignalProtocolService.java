package com.cryptlink.security;

import org.springframework.stereotype.Service;
import java.security.*;
import java.security.spec.*;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.*;

@Service
public class SignalProtocolService {

    private static final String CURVE_NAME = "secp256r1";
    private static final String KEY_ALGORITHM = "EC";
    private static final String SIGNATURE_ALGORITHM = "SHA256withECDSA";
    private static final String KEY_EXCHANGE_ALGORITHM = "ECDH";
    
    // Key pairs for users
    private final Map<String, KeyPair> userKeyPairs = new HashMap<>();
    private final Map<String, PublicKey> userPublicKeys = new HashMap<>();
    
    /**
     * Generate key pair for a user
     */
    public KeyPair generateKeyPair(String userId) throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance(KEY_ALGORITHM);
        ECGenParameterSpec ecSpec = new ECGenParameterSpec(CURVE_NAME);
        keyGen.initialize(ecSpec);
        
        KeyPair keyPair = keyGen.generateKeyPair();
        userKeyPairs.put(userId, keyPair);
        userPublicKeys.put(userId, keyPair.getPublic());
        
        return keyPair;
    }
    
    /**
     * Get user's public key
     */
    public PublicKey getPublicKey(String userId) {
        return userPublicKeys.get(userId);
    }
    
    /**
     * Register public key for a user
     */
    public void registerPublicKey(String userId, PublicKey publicKey) {
        userPublicKeys.put(userId, publicKey);
    }
    
    /**
     * Encrypt message for recipient
     */
    public EncryptedMessage encryptMessage(String senderId, String recipientId, String message) throws Exception {
        KeyPair senderKeyPair = userKeyPairs.get(senderId);
        PublicKey recipientPublicKey = userPublicKeys.get(recipientId);
        
        if (senderKeyPair == null || recipientPublicKey == null) {
            throw new RuntimeException("Keys not available for encryption");
        }
        
        // Perform ECDH key exchange
        KeyAgreement keyAgreement = KeyAgreement.getInstance(KEY_EXCHANGE_ALGORITHM);
        keyAgreement.init(senderKeyPair.getPrivate());
        keyAgreement.doPhase(recipientPublicKey, true);
        
        byte[] sharedSecret = keyAgreement.generateSecret();
        
        // Derive encryption key from shared secret
        byte[] encryptionKey = deriveKey(sharedSecret, "encryption");
        
        // Encrypt message
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        SecretKeySpec secretKey = new SecretKeySpec(encryptionKey, "AES");
        byte[] iv = new byte[12]; // GCM IV
        new SecureRandom().nextBytes(iv);
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);
        
        byte[] encryptedMessage = cipher.doFinal(message.getBytes());
        
        // Sign the encrypted message
        byte[] signature = signMessage(senderKeyPair.getPrivate(), encryptedMessage);
        
        return new EncryptedMessage(
            Base64.getEncoder().encodeToString(encryptedMessage),
            Base64.getEncoder().encodeToString(iv),
            Base64.getEncoder().encodeToString(signature),
            senderId,
            recipientId
        );
    }
    
    /**
     * Decrypt message
     */
    public String decryptMessage(String recipientId, EncryptedMessage encryptedMessage) throws Exception {
        KeyPair recipientKeyPair = userKeyPairs.get(recipientId);
        PublicKey senderPublicKey = userPublicKeys.get(encryptedMessage.getSenderId());
        
        if (recipientKeyPair == null || senderPublicKey == null) {
            throw new RuntimeException("Keys not available for decryption");
        }
        
        // Perform ECDH key exchange
        KeyAgreement keyAgreement = KeyAgreement.getInstance(KEY_EXCHANGE_ALGORITHM);
        keyAgreement.init(recipientKeyPair.getPrivate());
        keyAgreement.doPhase(senderPublicKey, true);
        
        byte[] sharedSecret = keyAgreement.generateSecret();
        
        // Derive encryption key from shared secret
        byte[] encryptionKey = deriveKey(sharedSecret, "encryption");
        
        // Decrypt message
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        SecretKeySpec secretKey = new SecretKeySpec(encryptionKey, "AES");
        
        byte[] iv = Base64.getDecoder().decode(encryptedMessage.getIv());
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);
        
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedMessage.getEncryptedContent());
        byte[] decryptedMessage = cipher.doFinal(encryptedBytes);
        
        // Verify signature
        byte[] signature = Base64.getDecoder().decode(encryptedMessage.getSignature());
        if (!verifySignature(senderPublicKey, encryptedBytes, signature)) {
            throw new RuntimeException("Message signature verification failed");
        }
        
        return new String(decryptedMessage);
    }
    
    /**
     * Sign message
     */
    private byte[] signMessage(PrivateKey privateKey, byte[] message) throws Exception {
        Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
        signature.initSign(privateKey);
        signature.update(message);
        return signature.sign();
    }
    
    /**
     * Verify signature
     */
    private boolean verifySignature(PublicKey publicKey, byte[] message, byte[] signature) throws Exception {
        Signature sig = Signature.getInstance(SIGNATURE_ALGORITHM);
        sig.initVerify(publicKey);
        sig.update(message);
        return sig.verify(signature);
    }
    
    /**
     * Derive key from shared secret
     */
    private byte[] deriveKey(byte[] sharedSecret, String purpose) throws Exception {
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        sha256.update(sharedSecret);
        sha256.update(purpose.getBytes());
        return Arrays.copyOf(sha256.digest(), 32); // 256 bits for AES-256
    }
    
    /**
     * Generate session key for group chat
     */
    public String generateGroupSessionKey(String groupId) throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256);
        SecretKey secretKey = keyGen.generateKey();
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }
    
    /**
     * Encrypt group message
     */
    public EncryptedMessage encryptGroupMessage(String senderId, String groupId, String message, String sessionKey) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(sessionKey);
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        byte[] iv = new byte[12];
        new SecureRandom().nextBytes(iv);
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);
        
        byte[] encryptedMessage = cipher.doFinal(message.getBytes());
        
        return new EncryptedMessage(
            Base64.getEncoder().encodeToString(encryptedMessage),
            Base64.getEncoder().encodeToString(iv),
            "", // No signature for group messages (handled differently)
            senderId,
            groupId
        );
    }
    
    /**
     * Decrypt group message
     */
    public String decryptGroupMessage(String sessionKey, EncryptedMessage encryptedMessage) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(sessionKey);
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        byte[] iv = Base64.getDecoder().decode(encryptedMessage.getIv());
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);
        
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedMessage.getEncryptedContent());
        byte[] decryptedMessage = cipher.doFinal(encryptedBytes);
        
        return new String(decryptedMessage);
    }
    
    /**
     * Encrypted message wrapper
     */
    public static class EncryptedMessage {
        private final String encryptedContent;
        private final String iv;
        private final String signature;
        private final String senderId;
        private final String recipientId;
        
        public EncryptedMessage(String encryptedContent, String iv, String signature, String senderId, String recipientId) {
            this.encryptedContent = encryptedContent;
            this.iv = iv;
            this.signature = signature;
            this.senderId = senderId;
            this.recipientId = recipientId;
        }
        
        // Getters
        public String getEncryptedContent() { return encryptedContent; }
        public String getIv() { return iv; }
        public String getSignature() { return signature; }
        public String getSenderId() { return senderId; }
        public String getRecipientId() { return recipientId; }
    }
}
