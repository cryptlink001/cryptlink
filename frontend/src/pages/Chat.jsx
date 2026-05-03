import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, Phone, Video, MoreVertical, Circle } from 'lucide-react';
import { messageAPI, userAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuthStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await messageAPI.getRecentChatPartners(user.id);
      setChats(response.data || []);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatUserId) => {
    try {
      const response = await messageAPI.getChatMessages(user.id, chatUserId);
      setMessages(response.data.content || response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await userAPI.getOnlineUsers(0, 20);
      setOnlineUsers(response.data.content || response.data);
    } catch (error) {
      console.error('Failed to fetch online users');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        senderId: user.id,
        receiverId: selectedChat.id,
        content: newMessage.trim(),
        messageType: 'TEXT'
      };

      const response = await messageAPI.sendMessage(messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleChatSelect = (chatUser) => {
    setSelectedChat(chatUser);
    fetchMessages(chatUser.id);
  };

  useEffect(() => {
    fetchChats();
    fetchOnlineUsers();
    
    // Set up polling for online users
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredChats = chats.filter(chat => 
    chat.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-cyber-gray mb-3">Online Now</h3>
            <div className="flex space-x-2 overflow-x-auto">
              {onlineUsers.slice(0, 5).map((onlineUser) => (
                <button
                  key={onlineUser.id}
                  onClick={() => handleChatSelect(onlineUser)}
                  className="flex flex-col items-center space-y-1 min-w-[60px]"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {onlineUser.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-cyber-green rounded-full border-2 border-cyber-black"></div>
                  </div>
                  <span className="text-xs text-cyber-gray truncate max-w-[60px]">
                    {onlineUser.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-cyber-gray">No chats yet</p>
              <p className="text-sm text-cyber-gray mt-2">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-white/5 transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {chat.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-cyber-green rounded-full border-2 border-cyber-black"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">@{chat.username}</h4>
                      <span className="text-xs text-cyber-gray">
                        {chat.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-cyber-gray truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedChat.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {selectedChat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyber-green rounded-full border-2 border-cyber-black"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">@{selectedChat.username}</h3>
                  <p className="text-xs text-cyber-gray">
                    {selectedChat.isOnline ? 'Online' : 'Offline'}
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
                    isOwn={message.senderId === user.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Paperclip className="w-5 h-5 text-cyber-gray" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="cyber-input flex-1 px-4 py-2 rounded-lg text-white placeholder-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white hover:shadow-cyber-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue flex items-center justify-center">
                <Send className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to Chat</h3>
              <p className="text-cyber-gray">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white' 
          : 'glass-dark text-white'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isOwn ? 'text-white/70' : 'text-cyber-gray'
        }`}>
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};

export default Chat;
