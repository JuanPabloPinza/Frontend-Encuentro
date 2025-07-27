'use client';

import { useEffect, useState } from 'react';

/**
 * Component to clean up conflicting token storage
 * This runs once when the app loads to fix any existing token conflicts
 */
export function TokenCleanup() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const authStore = localStorage.getItem('auth-store');
    let hasValidAuthStore = false;
    
    try {
      if (authStore) {
        const parsed = JSON.parse(authStore);
        hasValidAuthStore = !!(parsed.state?.token && parsed.state?.user);
      }
    } catch {
      // Invalid auth-store, remove it
      localStorage.removeItem('auth-store');
    }
    
    // If we don't have a valid auth store, clear all token-related items
    if (!hasValidAuthStore) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth-store');
      console.log('TokenCleanup: Cleared invalid tokens');
    } else {
      // If we have a valid auth store, remove the legacy tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      console.log('TokenCleanup: Removed legacy tokens');
    }
  }, [mounted]);

  return null; // This component renders nothing
}