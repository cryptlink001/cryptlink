import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const useWebSocket = () => {
  const { user, token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineStatus, setOnlineStatus] = useState({});
  const stompClient = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!user || !token) return;

    try {
      // Create WebSocket connection
      const socket = new SockJS(`${process.env.REACT_APP_WS_URL}/chat`);
      stompClient.current = Client.over(socket);

      // Configure headers
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Connect with headers
      stompClient.current.connect(headers, () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Subscribe to personal messages
        stompClient.current.subscribe('/user/queue/messages', (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, newMessage]);
          
          // Show notification for new messages
          if (newMessage.sender.id !== user.id) {
            toast(`New message from @${newMessage.sender.username}`, {
              icon: '💬',
              duration: 3000
            });
          }
        });

        // Subscribe to typing notifications
        stompClient.current.subscribe('/user/queue/typing', (message) => {
          const typingData = JSON.parse(message.body);
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (typingData.isTyping) {
              newSet.add(typingData.senderId);
            } else {
              newSet.delete(typingData.senderId);
            }
            return newSet;
          });
        });

        // Subscribe to status updates
        stompClient.current.subscribe('/user/queue/status', (message) => {
          const statusData = JSON.parse(message.body);
          if (statusData.type === 'online_status') {
            setOnlineStatus(prev => ({
              ...prev,
              [statusData.userId]: statusData.isOnline
            }));
          }
        });

        // Subscribe to online status broadcasts
        stompClient.current.subscribe('/topic/online_status', (message) => {
          const statusData = JSON.parse(message.body);
          setOnlineStatus(prev => ({
            ...prev,
            [statusData.userId]: statusData.isOnline
          }));
        });

        // Subscribe to errors
        stompClient.current.subscribe('/user/queue/errors', (message) => {
          const error = JSON.parse(message.body);
          toast.error(error.message || 'WebSocket error occurred');
        });

        // Send online status
        sendOnlineStatus(true);

      }, (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
        handleReconnect();
      });

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      handleReconnect();
    }
  };

  const disconnect = () => {
    if (stompClient.current && isConnected) {
      // Send offline status before disconnecting
      sendOnlineStatus(false);
      
      stompClient.current.disconnect(() => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });
    }
  };

  const handleReconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
      
      setTimeout(() => {
        connect();
      }, 5000 * reconnectAttempts.current); // Exponential backoff
    } else {
      toast.error('Failed to connect to chat server');
    }
  };

  const sendMessage = (receiverId, content) => {
    if (stompClient.current && isConnected) {
      const messageData = {
        content,
        timestamp: new Date().toISOString()
      };

      stompClient.current.send(
        `/app/chat/sendMessage/${receiverId}`,
        {},
        JSON.stringify(messageData)
      );
    }
  };

  const sendTypingNotification = (receiverId, isTyping) => {
    if (stompClient.current && isConnected) {
      const typingData = {
        isTyping,
        timestamp: new Date().toISOString()
      };

      stompClient.current.send(
        `/app/chat/typing/${receiverId}`,
        {},
        JSON.stringify(typingData)
      );
    }
  };

  const markMessageAsSeen = (messageId) => {
    if (stompClient.current && isConnected) {
      stompClient.current.send(
        `/app/chat/markAsSeen/${messageId}`,
        {},
        {}
      );
    }
  };

  const sendOnlineStatus = (isOnline) => {
    if (stompClient.current && isConnected) {
      const statusData = {
        isOnline,
        timestamp: new Date().toISOString()
      };

      stompClient.current.send(
        '/app/chat/onlineStatus',
        {},
        JSON.stringify(statusData)
      );
    }
  };

  useEffect(() => {
    if (user && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    messages,
    typingUsers,
    onlineStatus,
    sendMessage,
    sendTypingNotification,
    markMessageAsSeen,
    sendOnlineStatus,
    reconnect: connect
  };
};

export default useWebSocket;
