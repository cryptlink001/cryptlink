package com.cryptlink.service;

import com.cryptlink.model.Message;
import com.cryptlink.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Transactional
    public Message saveMessage(Message message) {
        message.setCreatedAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public Message getMessageById(UUID messageId) {
        return messageRepository.findById(messageId).orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<Message> getChatMessages(UUID userId1, UUID userId2, Pageable pageable) {
        return messageRepository.findChatMessages(userId1, userId2, pageable);
    }

    @Transactional(readOnly = true)
    public List<Message> getUnreadMessages(UUID userId) {
        return messageRepository.findUnreadMessages(userId);
    }

    @Transactional(readOnly = true)
    public Long getUnreadMessageCount(UUID userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    @Transactional
    public void markAsSeen(UUID messageId) {
        Message message = getMessageById(messageId);
        if (message != null) {
            message.markAsSeen();
            messageRepository.save(message);
        }
    }

    @Transactional
    public void markAllMessagesAsSeen(UUID userId1, UUID userId2) {
        List<Message> unreadMessages = messageRepository.findUnreadMessages(userId1);
        unreadMessages.stream()
            .filter(msg -> msg.getSender().getId().equals(userId2))
            .forEach(Message::markAsSeen);
        messageRepository.saveAll(unreadMessages);
    }

    @Transactional
    public void deleteMessage(UUID messageId) {
        Message message = getMessageById(messageId);
        if (message != null) {
            message.delete();
            messageRepository.save(message);
        }
    }

    @Transactional
    public void editMessage(UUID messageId, String newContent) {
        Message message = getMessageById(messageId);
        if (message != null) {
            message.editContent(newContent);
            messageRepository.save(message);
        }
    }

    @Transactional(readOnly = true)
    public List<UUID> getRecentChatPartners(UUID userId) {
        return messageRepository.findRecentChatPartners(userId);
    }

    @Transactional
    public void cleanupOldMessages() {
        LocalDateTime cutoff = LocalDateTime.now().minusMonths(6);
        List<Message> messagesToDelete = messageRepository.findMessagesToDelete(cutoff);
        messageRepository.deleteAll(messagesToDelete);
    }
}
