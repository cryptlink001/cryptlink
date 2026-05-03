import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Actions
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', credentials);
          const { token, refreshToken, userId, username, email } = response.data;
          
          set({
            user: { id: userId, username, email },
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      signup: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/signup', userData);
          const { token, refreshToken, userId, username, email } = response.data;
          
          set({
            user: { id: userId, username, email },
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          // Remove authorization header
          delete api.defaults.headers.common['Authorization'];
        }
      },
      
      refreshToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const response = await api.post('/auth/refresh', refreshToken);
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          set({
            token: newToken,
            refreshToken: newRefreshToken,
          });
          
          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          return newToken;
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
      
      initializeAuth: () => {
        const { token, user } = get();
        if (token && user) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
