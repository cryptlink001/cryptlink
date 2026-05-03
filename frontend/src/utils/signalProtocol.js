// Frontend Signal Protocol Implementation
import CryptoJS from 'crypto-js';

class SignalProtocol {
    constructor() {
        this.keyPairs = new Map();
        this.publicKeys = new Map();
        this.groupSessionKeys = new Map();
    }

    // Generate key pair for user
    async generateKeyPair(userId) {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-256"
            },
            true,
            ["deriveKey", "sign"]
        );

        this.keyPairs.set(userId, keyPair);
        
        const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        this.publicKeys.set(userId, publicKey);
        
        return keyPair;
    }

    // Get public key as base64 string
    async getPublicKeyString(userId) {
        const publicKey = this.publicKeys.get(userId);
        if (!publicKey) return null;
        
        return this.arrayBufferToBase64(publicKey);
    }

    // Register public key from another user
    async registerPublicKey(userId, publicKeyString) {
        const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyString);
        const publicKey = await window.crypto.subtle.importKey(
            "spki",
            publicKeyBuffer,
            {
                name: "ECDH",
                namedCurve: "P-256"
            },
            true,
            []
        );
        
        this.publicKeys.set(userId, publicKey);
    }

    // Encrypt message for recipient
    async encryptMessage(senderId, recipientId, message) {
        const senderKeyPair = this.keyPairs.get(senderId);
        const recipientPublicKey = this.publicKeys.get(recipientId);
        
        if (!senderKeyPair || !recipientPublicKey) {
            throw new Error('Keys not available for encryption');
        }

        // Perform ECDH key exchange
        const sharedSecret = await window.crypto.subtle.deriveKey(
            {
                name: "ECDH",
                public: recipientPublicKey
            },
            senderKeyPair.privateKey,
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );

        // Generate random IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // Encrypt message
        const encodedMessage = new TextEncoder().encode(message);
        const encryptedMessage = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            sharedSecret,
            encodedMessage
        );

        // Sign the message
        const signature = await window.crypto.subtle.sign(
            "ECDSA",
            senderKeyPair.privateKey,
            encryptedMessage
        );

        return {
            encryptedContent: this.arrayBufferToBase64(encryptedMessage),
            iv: this.arrayBufferToBase64(iv),
            signature: this.arrayBufferToBase64(signature),
            senderId: senderId,
            recipientId: recipientId,
            timestamp: Date.now()
        };
    }

    // Decrypt message
    async decryptMessage(recipientId, encryptedMessageObj) {
        const recipientKeyPair = this.keyPairs.get(recipientId);
        const senderPublicKey = this.publicKeys.get(encryptedMessageObj.senderId);
        
        if (!recipientKeyPair || !senderPublicKey) {
            throw new Error('Keys not available for decryption');
        }

        // Perform ECDH key exchange
        const sharedSecret = await window.crypto.subtle.deriveKey(
            {
                name: "ECDH",
                public: senderPublicKey
            },
            recipientKeyPair.privateKey,
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );

        // Decrypt message
        const encryptedContent = this.base64ToArrayBuffer(encryptedMessageObj.encryptedContent);
        const iv = this.base64ToArrayBuffer(encryptedMessageObj.iv);
        
        const decryptedMessage = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            sharedSecret,
            encryptedContent
        );

        // Verify signature
        const signature = this.base64ToArrayBuffer(encryptedMessageObj.signature);
        const isValid = await window.crypto.subtle.verify(
            "ECDSA",
            senderPublicKey,
            signature,
            encryptedContent
        );

        if (!isValid) {
            throw new Error('Message signature verification failed');
        }

        return new TextDecoder().decode(decryptedMessage);
    }

    // Generate group session key
    generateGroupSessionKey(groupId) {
        const key = CryptoJS.lib.WordArray.random(32);
        const sessionKey = key.toString(CryptoJS.enc.Base64);
        this.groupSessionKeys.set(groupId, sessionKey);
        return sessionKey;
    }

    // Encrypt group message
    encryptGroupMessage(senderId, groupId, message) {
        const sessionKey = this.groupSessionKeys.get(groupId);
        if (!sessionKey) {
            throw new Error('Group session key not found');
        }

        const key = CryptoJS.enc.Base64.parse(sessionKey);
        const iv = CryptoJS.lib.WordArray.random(16);
        
        const encrypted = CryptoJS.AES.encrypt(message, key, {
            iv: iv,
            mode: CryptoJS.mode.GCM,
            padding: CryptoJS.pad.NoPadding
        });

        return {
            encryptedContent: encrypted.toString(),
            iv: CryptoJS.enc.Base64.stringify(iv),
            senderId: senderId,
            groupId: groupId,
            timestamp: Date.now()
        };
    }

    // Decrypt group message
    decryptGroupMessage(groupId, encryptedMessageObj) {
        const sessionKey = this.groupSessionKeys.get(groupId);
        if (!sessionKey) {
            throw new Error('Group session key not found');
        }

        const key = CryptoJS.enc.Base64.parse(sessionKey);
        const iv = CryptoJS.enc.Base64.parse(encryptedMessageObj.iv);
        
        const decrypted = CryptoJS.AES.decrypt(encryptedMessageObj.encryptedContent, key, {
            iv: iv,
            mode: CryptoJS.mode.GCM,
            padding: CryptoJS.pad.NoPadding
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    // Helper functions
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Clear keys for user
    clearKeys(userId) {
        this.keyPairs.delete(userId);
        this.publicKeys.delete(userId);
    }

    // Clear group session key
    clearGroupSessionKey(groupId) {
        this.groupSessionKeys.delete(groupId);
    }
}

export default new SignalProtocol();
