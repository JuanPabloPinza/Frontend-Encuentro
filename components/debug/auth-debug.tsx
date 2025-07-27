'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

/**
 * Debug component to show authentication state in development
 * Only visible in development mode
 */
export function AuthDebug() {
  const { user, token, isAuthenticated, error } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<{
    authStore: boolean;
    authToken: boolean;
    authTokenLegacy: boolean;
  }>({
    authStore: false,
    authToken: false,
    authTokenLegacy: false
  });

  // Only mount on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage items
    setLocalStorageData({
      authStore: !!localStorage.getItem('auth-store'),
      authToken: !!localStorage.getItem('auth_token'),
      authTokenLegacy: !!localStorage.getItem('authToken')
    });
  }, []);

  // Only show in development and after mounting
  if (process.env.NODE_ENV !== 'development' || !mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔧 Auth Debug</div>
      <div>
        <strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}
      </div>
      <div>
        <strong>User:</strong> {user ? `${user.username} (${user.role})` : 'None'}
      </div>
      <div>
        <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}
      </div>
      <div>
        <strong>Error:</strong> {error || 'None'}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-xs text-gray-300">localStorage:</div>
        <div className="text-xs">
          auth-store: {localStorageData.authStore ? '✅' : '❌'}
        </div>
        <div className="text-xs">
          auth_token: {localStorageData.authToken ? '⚠️' : '❌'}
        </div>
        <div className="text-xs">
          authToken: {localStorageData.authTokenLegacy ? '⚠️' : '❌'}
        </div>
      </div>
    </div>
  );
}