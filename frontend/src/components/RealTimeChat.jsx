import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, Circle } from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import { messageAPI } from '../utils/api';
import toast from 'react-hot-toast';

const RealTimeChat = ({ selectedChat, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  
  const {
    isConnected,
    typingUsers,
    onlineStatus,
    sendMessage,
    sendTypingNotification,
    markMessageAsSeen
  } = useWebSocket();

  // Load initial messages
  useEffect(() => {
    if (selectedChat && currentUser) {
      loadMessages();
    }
  }, [selectedChat, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      sendTypingNotification(selectedChat.id, true);
    }

    if (value.length === 0) {
      setIsTyping(false);
      sendTypingNotification(selectedChat.id, false);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingNotification(selectedChat.id, false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const loadMessages = async () => {
    try {
      const response = await messageAPI.getChatMessages(currentUser.id, selectedChat.id, 0, 50);
      setMessages(response.data.content || response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      sendMessage(selectedChat.id, newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
      sendTypingNotification(selectedChat.id, false);
      
      // Clear typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserOnline = () => {
    return onlineStatus[selectedChat?.id] || false;
  };

  const isUserTyping = () => {
    return typingUsers.has(selectedChat?.id);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
            <Send className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Real-Time Chat</h3>
          <p className="text-cyber-gray">Select a conversation to start messaging</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyber-green' : 'bg-cyber-red'}`}></div>
            <span className={`text-sm ${isConnected ? 'text-cyber-green' : 'text-cyber-red'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
              <span className="text-white font-semibold">
                {selectedChat.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            {isUserOnline() && (
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyber-green rounded-full border-2 border-cyber-black"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">@{selectedChat.username}</h3>
            <p className="text-xs text-cyber-gray flex items-center">
              {isUserTyping() ? (
                <span className="flex items-center">
                  <Circle className="w-2 h-2 mr-1 animate-pulse" />
                  typing...
                </span>
              ) : (
                <span>{isUserOnline() ? 'Online' : 'Offline'}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Phone className="w-5 h-5 text-cyber-gray" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Video className="w-5 h-5 text-cyber-gray" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <MoreVertical className="w-5 h-5 text-cyber-gray" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-cyber-gray">No messages yet</p>
            <p className="text-sm text-cyber-gray mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser.id}
              onSeen={() => markMessageAsSeen(message.id)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="p-2 bg-cyber-red/20 border-t border-cyber-red/50">
          <p className="text-center text-cyber-red text-sm">
            Connection lost. Attempting to reconnect...
          </p>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Paperclip className="w-5 h-5 text-cyber-gray" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="cyber-input flex-1 px-4 py-2 rounded-lg text-white placeholder-gray-400"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white hover:shadow-cyber-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn, onSeen }) => {
  const [isSeen, setIsSeen] = useState(message.isSeen);

  useEffect(() => {
    if (!isOwn && !isSeen && message.id) {
      onSeen();
      setIsSeen(true);
    }
  }, [message.id, isOwn, isSeen, onSeen]);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white' 
          : 'glass-dark text-white'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-between mt-1 ${
          isOwn ? 'text-white/70' : 'text-cyber-gray'
        }`}>
          <p className="text-xs">
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          {isOwn && (
            <span className="text-xs">
              {message.isSeen ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeChat;
