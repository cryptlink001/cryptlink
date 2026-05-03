import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          const refreshToken = authData.state?.refreshToken;
          
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, refreshToken);
            const { token: newToken, refreshToken: newRefreshToken } = response.data;
            
            // Update stored tokens
            authData.state.token = newToken;
            authData.state.refreshToken = newRefreshToken;
            localStorage.setItem('auth-storage', JSON.stringify(authData));
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || error.response.data?.error || 'Server error';
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your connection.';
    } else {
      // Something else happened
      errorMessage = error.message || 'An unexpected error occurred';
    }
    
    // Show error toast (except for certain cases)
    if (!originalRequest._skipErrorToast) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', refreshToken),
  getCurrentUser: () => api.get('/auth/me'),
};

export const userAPI = {
  getUserById: (userId) => api.get(`/users/${userId}`),
  getUserByUsername: (username) => api.get(`/users/username/${username}`),
  searchUsers: (query, page = 0, size = 10) => 
    api.get('/users/search', { params: { query, page, size } }),
  getOnlineUsers: (page = 0, size = 10) => 
    api.get('/users/online', { params: { page, size } }),
  getFollowers: (userId, page = 0, size = 10) => 
    api.get(`/users/${userId}/followers`, { params: { page, size } }),
  getFollowing: (userId, page = 0, size = 10) => 
    api.get(`/users/${userId}/following`, { params: { page, size } }),
  updateProfile: (userId, userData) => api.put(`/users/${userId}/profile`, userData),
  updatePrivacySettings: (userId, privacyData) => api.put(`/users/${userId}/privacy`, privacyData),
  followUser: (userId, targetUserId) => api.post(`/users/${userId}/follow/${targetUserId}`),
  unfollowUser: (userId, targetUserId) => api.post(`/users/${userId}/unfollow/${targetUserId}`),
  updateOnlineStatus: (userId, isOnline) => 
    api.put(`/users/${userId}/online`, null, { params: { isOnline } }),
  isFollowing: (userId, targetUserId) => api.get(`/users/${userId}/is-following/${targetUserId}`),
  getOnlineUsersCount: () => api.get('/users/online/count'),
};

export const postAPI = {
  getFeedPosts: (page = 0, size = 10) => 
    api.get('/posts/feed', { params: { page, size } }),
  getFollowingPosts: (page = 0, size = 10) => 
    api.get('/posts/following', { params: { page, size } }),
  getUserPosts: (userId, page = 0, size = 10) => 
    api.get(`/posts/user/${userId}`, { params: { page, size } }),
  getTrendingPosts: (page = 0, size = 10) => 
    api.get('/posts/trending', { params: { page, size } }),
  searchPosts: (query, page = 0, size = 10) => 
    api.get('/posts/search', { params: { query, page, size } }),
  createPost: (postData) => api.post('/posts', postData),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
  commentOnPost: (postId, comment) => api.post(`/posts/${postId}/comments`, { content: comment }),
  getPostComments: (postId, page = 0, size = 10) => 
    api.get(`/posts/${postId}/comments`, { params: { page, size } }),
};

export const reelAPI = {
  getFeedReels: (page = 0, size = 10) => 
    api.get('/reels/feed', { params: { page, size } }),
  getFollowingReels: (page = 0, size = 10) => 
    api.get('/reels/following', { params: { page, size } }),
  getUserReels: (userId, page = 0, size = 10) => 
    api.get(`/reels/user/${userId}`, { params: { page, size } }),
  getTrendingReels: (page = 0, size = 10) => 
    api.get('/reels/trending', { params: { page, size } }),
  searchReels: (query, page = 0, size = 10) => 
    api.get('/reels/search', { params: { query, page, size } }),
  createReel: (reelData) => api.post('/reels', reelData),
  likeReel: (reelId) => api.post(`/reels/${reelId}/like`),
  unlikeReel: (reelId) => api.delete(`/reels/${reelId}/like`),
  commentOnReel: (reelId, comment) => api.post(`/reels/${reelId}/comments`, { content: comment }),
  getReelComments: (reelId, page = 0, size = 10) => 
    api.get(`/reels/${reelId}/comments`, { params: { page, size } }),
  viewReel: (reelId) => api.post(`/reels/${reelId}/view`),
};

export const messageAPI = {
  getChatMessages: (userId1, userId2, page = 0, size = 20) => 
    api.get('/messages/chat', { params: { userId1, userId2, page, size } }),
  sendMessage: (messageData) => api.post('/messages', messageData),
  markMessageAsSeen: (messageId) => api.put(`/messages/${messageId}/seen`),
  getUnreadMessages: (userId) => api.get(`/messages/unread/${userId}`),
  getUnreadMessageCount: (userId) => api.get(`/messages/unread/count/${userId}`),
  getRecentChatPartners: (userId) => api.get(`/messages/partners/${userId}`),
};

export default api;
