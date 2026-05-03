package com.cryptlink.controller;

import com.cryptlink.model.Message;
import com.cryptlink.model.User;
import com.cryptlink.service.MessageService;
import com.cryptlink.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Controller
public class WebSocketController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/sendMessage/{receiverId}")
    public void sendMessage(
            @Payload Map<String, Object> messageMap,
            @DestinationVariable String receiverId,
            Principal principal) {
        
        try {
            String senderId = principal.getName();
            
            // Create message
            Message message = new Message();
            message.setSender(userService.getUserById(java.util.UUID.fromString(senderId)));
            message.setReceiver(userService.getUserById(java.util.UUID.fromString(receiverId)));
            message.setContent((String) messageMap.get("content"));
            message.setMessageType(Message.MessageType.TEXT);
            
            // Save message
            Message savedMessage = messageService.saveMessage(message);
            
            // Send to receiver
            messagingTemplate.convertAndSendToUser(
                receiverId, 
                "/queue/messages", 
                savedMessage
            );
            
            // Send confirmation to sender
            messagingTemplate.convertAndSendToUser(
                senderId,
                "/queue/messages", 
                savedMessage
            );
            
            // Update online status
            Map<String, Object> statusUpdate = new HashMap<>();
            statusUpdate.put("type", "message_sent");
            statusUpdate.put("senderId", senderId);
            statusUpdate.put("receiverId", receiverId);
            statusUpdate.put("timestamp", java.time.LocalDateTime.now());
            
            messagingTemplate.convertAndSendToUser(
                receiverId,
                "/queue/status",
                statusUpdate
            );
            
        } catch (Exception e) {
            // Send error message
            Map<String, Object> error = new HashMap<>();
            error.put("type", "error");
            error.put("message", "Failed to send message");
            error.put("error", e.getMessage());
            
            messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                error
            );
        }
    }

    @MessageMapping("/chat/typing/{receiverId}")
    public void sendTypingNotification(
            @Payload Map<String, Object> typingData,
            @DestinationVariable String receiverId,
            Principal principal) {
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "typing");
        notification.put("senderId", principal.getName());
        notification.put("receiverId", receiverId);
        notification.put("isTyping", typingData.get("isTyping"));
        notification.put("timestamp", java.time.LocalDateTime.now());
        
        messagingTemplate.convertAndSendToUser(
            receiverId,
            "/queue/typing",
            notification
        );
    }

    @MessageMapping("/chat/markAsSeen/{messageId}")
    public void markMessageAsSeen(
            @DestinationVariable String messageId,
            Principal principal) {
        
        try {
            java.util.UUID msgId = java.util.UUID.fromString(messageId);
            Message message = messageService.getMessageById(msgId);
            
            if (message != && message.getReceiver().getId().toString().equals(principal.getName())) {
                messageService.markAsSeen(msgId);
                
                // Notify sender that message was seen
                Map<String, Object> seenNotification = new HashMap<>();
                seenNotification.put("type", "message_seen");
                seenNotification.put("messageId", messageId);
                seenNotification.put("seenBy", principal.getName());
                seenNotification.put("seenAt", java.time.LocalDateTime.now());
                
                messagingTemplate.convertAndSendToUser(
                    message.getSender().getId().toString(),
                    "/queue/status",
                    seenNotification
                );
            }
        } catch (Exception e) {
            // Handle error
        }
    }

    @MessageMapping("/chat/onlineStatus")
    public void updateOnlineStatus(
            @Payload Map<String, Object> statusData,
            Principal principal) {
        
        try {
            String userId = principal.getName();
            boolean isOnline = (Boolean) statusData.get("isOnline");
            
            userService.updateOnlineStatus(java.util.UUID.fromString(userId), isOnline);
            
            // Broadcast online status to followers
            Map<String, Object> statusUpdate = new HashMap<>();
            statusUpdate.put("type", "online_status");
            statusUpdate.put("userId", userId);
            statusUpdate.put("isOnline", isOnline);
            statusUpdate.put("timestamp", java.time.LocalDateTime.now());
            
            messagingTemplate.convertAndSend("/topic/online_status", statusUpdate);
            
        } catch (Exception e) {
            // Handle error
        }
    }
}
