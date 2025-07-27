import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    isAuthenticated,
    hasRole
  } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    if (token && !user) {
      checkAuth();
    }
  }, [token, user, checkAuth]);

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    isAuthenticated: isAuthenticated(),
    hasRole,
    isOrganizer: hasRole('organizer'),
    isAssistant: hasRole('assistant')
  };
};