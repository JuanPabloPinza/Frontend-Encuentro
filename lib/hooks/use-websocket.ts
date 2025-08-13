import { useEffect, useCallback } from 'react';
import { useWebSocketStore } from '../stores/websocket-store';
import { useAuth } from './use-auth';

export const useWebSocket = () => {
  const { user, isAuthenticated, token } = useAuth();
  const {
    isConnected,
    isConnecting,
    currentLocks,
    availabilityUpdates,
    error,
    currentEventRoom,
    connect,
    disconnect,
    joinEventRoom,
    lockTickets,
    unlockTickets,
    getMyLocks,
    clearError,
    clearAvailabilityUpdates
  } = useWebSocketStore();

  // Auto-connect when user is authenticated (with error handling) - DISABLED for manual testing
  // useEffect(() => {
  //   if (isAuthenticated && user && !isConnected && !isConnecting) {
  //     connect(user.id, token || undefined).catch((err) => {
  //       console.warn('WebSocket connection failed, continuing without real-time features:', err);
  //     });
  //   }
  // }, [isAuthenticated, user, token, isConnected, isConnecting, connect]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, isConnected, disconnect]);

  const connectToWebSocket = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    return await connect(user.id, token || undefined);
  }, [user, token, connect]);

  const joinRoom = useCallback((eventId: number) => {
    if (!user) throw new Error('User not authenticated');
    joinEventRoom(eventId, user.id);
  }, [user, joinEventRoom]);

  const lockEventTickets = useCallback(async (eventId: number, categoryId: number, quantity: number) => {
    if (!user) throw new Error('User not authenticated');
    return await lockTickets(eventId, categoryId, quantity, user.id);
  }, [user, lockTickets]);

  const unlockEventTickets = useCallback(async (eventId: number, categoryId: number, quantity: number) => {
    if (!user) throw new Error('User not authenticated');
    return await unlockTickets(eventId, categoryId, quantity, user.id);
  }, [user, unlockTickets]);

  return {
    // State
    isConnected,
    isConnecting,
    currentLocks,
    availabilityUpdates,
    error,
    currentEventRoom,
    
    // Actions
    connect: connectToWebSocket,
    disconnect,
    joinRoom,
    lockTickets: lockEventTickets,
    unlockTickets: unlockEventTickets,
    getMyLocks,
    clearError,
    clearAvailabilityUpdates,
    
    // Helper methods
    isInEventRoom: (eventId: number) => currentEventRoom === eventId,
    hasActiveLocks: currentLocks.length > 0,
    getLocksForEvent: (eventId: number) => currentLocks.filter(lock => lock.eventId === eventId),
    getAvailabilityForEvent: (eventId: number) => 
      availabilityUpdates.filter(update => update.eventId === eventId)
  };
};