import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '../types';
import { apiService } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasRole: (role: 'assistant' | 'organizer') => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login(credentials);
          
          // Clear any legacy tokens
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('authToken');
          }
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null
          });

          return { success: true };
        } catch (error: any) {
          const errorMessage = error.message || 'Login failed';
          set({
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.register(userData);
          
          set({
            isLoading: false,
            error: null
          });

          return { success: true };
        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed';
          set({
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        // Clear all possible token storage locations
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('auth-store');
        }
        
        set({
          user: null,
          token: null,
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        set({ isLoading: true });
        
        try {
          const user = await apiService.getProfile();
          set({
            user,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          // Token is invalid, clear auth state
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null
          });
        }
      },

      isAuthenticated: () => {
        const { user, token } = get();
        return !!(user && token);
      },

      hasRole: (role: 'assistant' | 'organizer') => {
        const { user } = get();
        return user?.role === role;
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);